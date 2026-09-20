<?php

namespace App\Services\Credit;

use App\Models\User;
use App\Models\CreditBatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class CreditManagerService
{
    /**
     * Get the total available balance of credits for a user.
     * Sums (total_credits - used_credits) where the batch is not expired.
     */
    public function getAvailableBalance(User $user): int
    {
        $this->syncPlanCredits($user);

        $balance = (int) CreditBatch::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->whereRaw('used_credits < total_credits')
            ->selectRaw('SUM(total_credits - used_credits) as total')
            ->value('total');

        if ($balance > 0) {
            return $balance;
        }

        // Fallback for legacy plans
        $entity = $user->entity;
        if ($entity && $entity->currentContract && $entity->currentContract->planVersion) {
            $planVersion = $entity->currentContract->planVersion;
            $limit = (int) $planVersion->quantity_certificates;
            if ($limit > 0) {
                $isPaid = ($planVersion->monthly_value > 0) || ($planVersion->annual_value > 0);
                $query = DB::table('documents')
                    ->where('entity_id', $entity->id)
                    ->whereNull('deleted_at');

                if ($isPaid) {
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                }

                $used = $query->count();
                return max(0, $limit - $used);
            }
        }

        return 0;
    }

    /**
     * Get a detailed breakdown of the user's credits.
     */
    public function getDetailedBalance(User $user): array
    {
        $this->syncPlanCredits($user);

        $batches = CreditBatch::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->get();

        $free = 0;
        $monthlyYearly = 0;
        $addon = 0;

        foreach ($batches as $batch) {
            $remaining = max(0, $batch->total_credits - $batch->used_credits);
            if ($batch->type === 'free') {
                $free += $remaining;
            } elseif ($batch->type === 'addon') {
                $addon += $remaining;
            } else {
                $monthlyYearly += $remaining;
            }
        }

        $total = $free + $monthlyYearly + $addon;

        if ($batches->isEmpty()) {
            // Check for legacy plan contract
            $entity = $user->entity;
            if ($entity && $entity->currentContract && $entity->currentContract->planVersion) {
                $planVersion = $entity->currentContract->planVersion;
                $limit = (int) $planVersion->quantity_certificates;
                if ($limit > 0) {
                    $isPaid = ($planVersion->monthly_value > 0) || ($planVersion->annual_value > 0);
                    $query = DB::table('documents')
                        ->where('entity_id', $entity->id)
                        ->whereNull('deleted_at');

                    if ($isPaid) {
                        $query->whereMonth('created_at', now()->month)
                              ->whereYear('created_at', now()->year);
                    }

                    $used = $query->count();
                    $remaining = max(0, $limit - $used);

                    return [
                        'total' => $remaining,
                        'free' => $isPaid ? 0 : $remaining,
                        'monthly_yearly' => $isPaid ? $remaining : 0,
                        'addon' => 0,
                        'limit' => $limit,
                        'used' => $used
                    ];
                }
            }
        }

        $totalLimit = 0;
        $totalUsed = 0;

        foreach ($batches as $batch) {
            $totalLimit += $batch->total_credits;
            $totalUsed += $batch->used_credits;
        }

        return [
            'total' => $total,
            'free' => $free,
            'monthly_yearly' => $monthlyYearly,
            'addon' => $addon,
            'limit' => $totalLimit > 0 ? $totalLimit : $total,
            'used' => $totalUsed
        ];
    }

    /**
     * Consume a specific amount of credits for a user.
     * Uses FIFO order based on expiration date, consuming 'free' credits last.
     * Throws ValidationException if available credits are insufficient.
     */
    public function consumeCredits(User $user, int $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $this->syncPlanCredits($user);

        $hasBatches = CreditBatch::where('user_id', $user->id)->exists();
        if (!$hasBatches) {
            // Legacy plan check fallback
            $entity = $user->entity;
            if ($entity && $entity->currentContract && $entity->currentContract->planVersion) {
                $planVersion = $entity->currentContract->planVersion;
                $limit = (int) $planVersion->quantity_certificates;
                if ($limit > 0) {
                    $isPaid = ($planVersion->monthly_value > 0) || ($planVersion->annual_value > 0);
                    $query = DB::table('documents')
                        ->where('entity_id', $entity->id)
                        ->whereNull('deleted_at');

                    if ($isPaid) {
                        $query->whereMonth('created_at', now()->month)
                              ->whereYear('created_at', now()->year);
                    }

                    $used = $query->count();
                    $remaining = max(0, $limit - $used);

                    if ($remaining < $amount) {
                        throw ValidationException::withMessages([
                            'credits' => ["You only have {$remaining} credits available. Please upgrade your plan or remove elements."]
                        ]);
                    }
                    return;
                }
            }
        }

        DB::transaction(function () use ($user, $amount) {
            $batches = CreditBatch::where('user_id', $user->id)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>=', now());
                })
                ->whereRaw('used_credits < total_credits')
                ->orderByRaw('CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END ASC')
                ->orderBy('expires_at', 'asc')
                ->lockForUpdate()
                ->get();

            $totalAvailable = $batches->sum(fn($b) => $b->total_credits - $b->used_credits);

            if ($totalAvailable < $amount) {
                throw ValidationException::withMessages([
                    'credits' => ["You only have {$totalAvailable} credits available. Please upgrade your plan or remove elements."]
                ]);
            }

            $remainingToDebit = $amount;
            foreach ($batches as $batch) {
                $availableInBatch = $batch->total_credits - $batch->used_credits;
                if ($availableInBatch <= 0) {
                    continue;
                }

                $debit = min($remainingToDebit, $availableInBatch);
                $batch->used_credits += $debit;
                $batch->save();

                $remainingToDebit -= $debit;
                if ($remainingToDebit <= 0) {
                    break;
                }
            }
        });
    }

    /**
     * Adopt cumulative strategy for subscription upgrade mid-month.
     * Terminates the old monthly batch, creates a new batch with the credit difference
     * of the larger plan, keeping the exact same expiration/anniversary cycle.
     */
    public function upgradePlan(User $user, int $newMonthlyCredits): void
    {
        DB::transaction(function () use ($user, $newMonthlyCredits) {
            $activeBatch = CreditBatch::where('user_id', $user->id)
                ->whereIn('type', ['monthly', 'yearly'])
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
                })
                ->orderBy('expires_at', 'desc')
                ->lockForUpdate()
                ->first();

            if (!$activeBatch) {
                CreditBatch::create([
                    'user_id' => $user->id,
                    'type' => 'monthly',
                    'total_credits' => $newMonthlyCredits,
                    'used_credits' => 0,
                    'start_date' => now(),
                    'expires_at' => now()->addDays(30)
                ]);
                return;
            }

            $oldTotal = $activeBatch->total_credits;
            if ($newMonthlyCredits > $oldTotal) {
                $creditDiff = $newMonthlyCredits - $oldTotal;
                $expiration = $activeBatch->expires_at;
                $startDate = $activeBatch->start_date;

                // Terminate old batch
                $activeBatch->total_credits = $activeBatch->used_credits;
                $activeBatch->save();

                // Create new batch with difference
                CreditBatch::create([
                    'user_id' => $user->id,
                    'type' => 'monthly',
                    'total_credits' => $creditDiff,
                    'used_credits' => 0,
                    'start_date' => $startDate,
                    'expires_at' => $expiration
                ]);
            }
        });
    }

    /**
     * Refund a credit to the user (e.g. when a document is deleted).
     * Finds the latest batches that have used_credits > 0 and decrements them.
     */
    public function refundCredits(User $user, int $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $hasBatches = CreditBatch::where('user_id', $user->id)->exists();
        if (!$hasBatches) {
            // Legacy plan doesn't use batches, count is dynamic based on active documents table.
            return;
        }

        DB::transaction(function () use ($user, $amount) {
            $batches = CreditBatch::where('user_id', $user->id)
                ->where('used_credits', '>', 0)
                ->orderByRaw('CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END DESC')
                ->orderBy('expires_at', 'desc')
                ->lockForUpdate()
                ->get();

            $remainingToRefund = $amount;
            foreach ($batches as $batch) {
                $used = $batch->used_credits;
                $refund = min($remainingToRefund, $used);
                
                $batch->used_credits -= $refund;
                $batch->save();

                $remainingToRefund -= $refund;
                if ($remainingToRefund <= 0) {
                    break;
                }
            }
        });
    }

    /**
     * Synchronize monthly recurring plan credits on-the-fly.
     * Ensures both monthly and annual plans grant exactly the monthly quantity
     * of certificates per month, non-cumulatively (the old batch expires).
     */
    public function syncPlanCredits(User $user): void
    {
        $entity = $user->entity;
        if (!$entity) {
            return;
        }

        $contract = $entity->contracts()->where('status', 'active')->first();
        if (!$contract) {
            return;
        }

        $planVersion = $contract->planVersion;
        if (!$planVersion) {
            return;
        }

        $credits = (int) $planVersion->quantity_certificates;
        if ($credits <= 0) {
            return;
        }

        // Calculate the current month interval of the subscription
        $activationDate = Carbon::parse($contract->activation_date);
        $now = Carbon::now();
        
        $monthsPassed = $activationDate->diffInMonths($now);
        $currentMonthStart = $activationDate->copy()->addMonths($monthsPassed);
        
        if ($currentMonthStart->isFuture()) {
            $monthsPassed--;
            $currentMonthStart = $activationDate->copy()->addMonths($monthsPassed);
        }
        
        $currentMonthEnd = $currentMonthStart->copy()->addMonth();
        
        $expirationDate = Carbon::parse($contract->expiration_date);
        if ($currentMonthEnd->isAfter($expirationDate)) {
            $currentMonthEnd = $expirationDate;
        }

        // We check if a batch for the current month start date already exists for this user.
        $batchExists = CreditBatch::where('user_id', $user->id)
            ->whereIn('type', ['monthly', 'yearly'])
            ->whereDate('start_date', $currentMonthStart->toDateString())
            ->exists();

        if (!$batchExists) {
            CreditBatch::create([
                'user_id'       => $user->id,
                'type'          => $contract->periodicity === 'annual' ? 'yearly' : 'monthly',
                'total_credits' => $credits,
                'used_credits'  => 0,
                'start_date'    => $currentMonthStart,
                'expires_at'    => $currentMonthEnd,
            ]);
        }
    }
}

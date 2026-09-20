<?php

namespace App\Observers;

use App\Models\EntityContract;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class EntityContractObserver
{
    public function creating(EntityContract $entityContract): void
    {
        if ($entityContract->status === 'active') {
            EntityContract::where('entity_id', $entityContract->entity_id)
            ->where('id', '<>', $entityContract->id)
            ->update(['status' => 'cancelled']);
        }
    }

    public function created(EntityContract $entityContract): void
    {
        if ($entityContract->status === 'active') {
            $this->grantContractCredits($entityContract);
        }
    }

    public function updated(EntityContract $entityContract): void
    {
        if ($entityContract->status === 'active') {
            EntityContract::where('entity_id', $entityContract->entity_id)
            ->where('id', '<>', $entityContract->id)
            ->update(['status' => 'cancelled']);

            $this->grantContractCredits($entityContract);
        }
    }

    protected function grantContractCredits(EntityContract $entityContract): void
    {
        $planVersion = $entityContract->planVersion;
        if (!$planVersion) {
            return;
        }

        $credits = (int) $planVersion->quantity_certificates;
        if ($credits <= 0) {
            return;
        }

        $userId = $entityContract->registered_by;
        if (!$userId) {
            $entity = \App\Models\Entity::with('config')->find($entityContract->entity_id);
            $userId = $entity?->config?->main_user_id;
        }

        if (!$userId) {
            return;
        }

        // Check if we already created a batch for this contract to avoid duplicates
        $alreadyGranted = \App\Models\CreditBatch::where('user_id', $userId)
            ->where('total_credits', $credits)
            ->whereDate('start_date', Carbon::parse($entityContract->activation_date)->toDateString())
            ->exists();

        if ($alreadyGranted) {
            return;
        }

        $activationDate = Carbon::parse($entityContract->activation_date ?: now());
        $currentMonthEnd = $activationDate->copy()->addMonth();

        $expirationDate = Carbon::parse($entityContract->expiration_date);
        if ($currentMonthEnd->isAfter($expirationDate)) {
            $currentMonthEnd = $expirationDate;
        }

        \App\Models\CreditBatch::create([
            'user_id'       => $userId,
            'type'          => $entityContract->periodicity === 'annual' ? 'yearly' : 'monthly',
            'total_credits' => $credits,
            'used_credits'  => 0,
            'start_date'    => $activationDate,
            'expires_at'    => $currentMonthEnd,
        ]);
    }
}

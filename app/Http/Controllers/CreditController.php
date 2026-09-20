<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use App\Models\PresenceList;
use App\Services\Credit\CreditManagerService;
use App\Services\Document\GenerateDocumentsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreditController extends Controller
{
    private CreditManagerService $creditService;

    public function __construct()
    {
        $this->creditService = new CreditManagerService();
    }

    /**
     * Get the detailed credit balance for the authenticated user.
     */
    public function balance(Request $request): JsonResponse
    {
        $user = Auth::user();
        $balance = $this->creditService->getDetailedBalance($user);
        return response()->json($balance);
    }

    /**
     * Resume an interrupted certificate emission flow from a recovery JSON file.
     */
    public function resume(Request $request): JsonResponse
    {
        $user = Auth::user();
        $recoveryData = $request->input('recovery_data');

        if (!$recoveryData || !isset($recoveryData['course_id']) || !isset($recoveryData['remaining_employees'])) {
            throw ValidationException::withMessages([
                'recovery_data' => ['Invalid recovery JSON payload structure.']
            ]);
        }

        $courseId = $recoveryData['course_id'];
        $originalConfig = $recoveryData['original_config'] ?? [];
        $remainingEmployees = $recoveryData['remaining_employees'];
        $totalEmployees = count($remainingEmployees);

        $availableBalance = $this->creditService->getAvailableBalance($user);

        if ($availableBalance <= 0) {
            throw ValidationException::withMessages([
                'credits' => ["You only have 0 credits available. Please upgrade your plan."]
            ]);
        }

        if ($availableBalance < $totalEmployees) {
            $employeesToProcess = array_slice($remainingEmployees, 0, $availableBalance);
            $newRemainingEmployees = array_slice($remainingEmployees, $availableBalance);

            $newRecoveryData = [
                'course_id' => $courseId,
                'original_config' => $originalConfig,
                'remaining_employees' => $newRemainingEmployees
            ];

            $validatedPayload = [
                'city_name' => $originalConfig['city_name'] ?? null,
                'company_name' => $originalConfig['company_name'] ?? null,
                'company_representative' => $originalConfig['company_representative'] ?? null,
                'city_id' => $originalConfig['city_id'] ?? null,
                'company_id' => $originalConfig['company_id'] ?? null,
                'position' => $originalConfig['position'] ?? null,
                'courses' => [
                    [
                        'course_id' => $courseId,
                        'number_of_hours_studied' => $originalConfig['number_of_hours_studied'] ?? null,
                        'periods' => $originalConfig['periods'] ?? [],
                        'date_init_validate' => $originalConfig['date_init_validate'] ?? null,
                        'date_end_validate' => $originalConfig['date_end_validate'] ?? null,
                        'instructors' => $originalConfig['instructors'] ?? [],
                        'issue_date' => $originalConfig['issue_date'] ?? null,
                        'employees' => $employeesToProcess
                    ]
                ]
            ];

            $templatePresenceList = DocumentTemplate::myScope()->find($originalConfig['presence_list_template_id'] ?? null);
            $versionPresenceList = $templatePresenceList?->versions()?->latest()?->first();

            DB::beginTransaction();
            try {
                $presenceList = PresenceList::create([
                    'uuid' => (string) Str::uuid(),
                    'entity_id' => $user->entity_id,
                    'number_of_hours_studied' => $originalConfig['number_of_hours_studied'] ?? 0,
                    'course_period' => json_encode($originalConfig['periods'] ?? []),
                    'course_id' => $courseId,
                    'presence_list_template_version_id' => $versionPresenceList?->id ?? null,
                    'city_id' => $originalConfig['city_id'] ?? null
                ]);

                $this->creditService->consumeCredits($user, count($employeesToProcess));

                $generator = new GenerateDocumentsService($user, $presenceList);
                $generator->execute($validatedPayload);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

            return response()->json([
                'partial' => true,
                'processed_count' => count($employeesToProcess),
                'remaining_count' => count($newRemainingEmployees),
                'recovery' => $newRecoveryData,
                'id' => $presenceList->id
            ]);
        }

        // Full resume processing
        $validatedPayload = [
            'city_name' => $originalConfig['city_name'] ?? null,
            'company_name' => $originalConfig['company_name'] ?? null,
            'company_representative' => $originalConfig['company_representative'] ?? null,
            'city_id' => $originalConfig['city_id'] ?? null,
            'company_id' => $originalConfig['company_id'] ?? null,
            'position' => $originalConfig['position'] ?? null,
            'courses' => [
                [
                    'course_id' => $courseId,
                    'number_of_hours_studied' => $originalConfig['number_of_hours_studied'] ?? null,
                    'periods' => $originalConfig['periods'] ?? [],
                    'date_init_validate' => $originalConfig['date_init_validate'] ?? null,
                    'date_end_validate' => $originalConfig['date_end_validate'] ?? null,
                    'instructors' => $originalConfig['instructors'] ?? [],
                    'issue_date' => $originalConfig['issue_date'] ?? null,
                    'employees' => $remainingEmployees
                ]
            ]
        ];

        $templatePresenceList = DocumentTemplate::myScope()->find($originalConfig['presence_list_template_id'] ?? null);
        $versionPresenceList = $templatePresenceList?->versions()?->latest()?->first();

        DB::beginTransaction();
        try {
            $presenceList = PresenceList::create([
                'uuid' => (string) Str::uuid(),
                'entity_id' => $user->entity_id,
                'number_of_hours_studied' => $originalConfig['number_of_hours_studied'] ?? 0,
                'course_period' => json_encode($originalConfig['periods'] ?? []),
                'course_id' => $courseId,
                'presence_list_template_version_id' => $versionPresenceList?->id ?? null,
                'city_id' => $originalConfig['city_id'] ?? null
            ]);

            $this->creditService->consumeCredits($user, $totalEmployees);

            $generator = new GenerateDocumentsService($user, $presenceList);
            $generator->execute($validatedPayload);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json([
            'success' => true,
            'id' => $presenceList->id
        ]);
    }

    /**
     * Handle plan upgrade trigger.
     */
    public function upgrade(Request $request): JsonResponse
    {
        $user = Auth::user();
        $request->validate([
            'new_monthly_credits' => 'required|integer|min:1'
        ]);

        $this->creditService->upgradePlan($user, $request->input('new_monthly_credits'));

        return response()->json([
            'success' => true,
            'message' => 'Plan upgraded successfully.'
        ]);
    }
}

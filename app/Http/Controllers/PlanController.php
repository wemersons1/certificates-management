<?php

namespace App\Http\Controllers;

use App\Http\Requests\Plan\CreatePlanRequest;
use App\Http\Requests\Plan\UpdatePlanRequest;
use App\Models\Plan;
use App\Models\PlanBenefit;
use App\Models\PlanVersion;
use App\Services\Files\DeleteFileS3Service;
use App\Services\Files\RegisterFilesS3Service;
use App\Services\Image\ConvertToPngService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $plans = Plan::myScope();

        if ($request->all) {
            $userLogged = Auth::user();
            if ($userLogged->alreadContractedPlan()) {
                $baseValue = $userLogged?->entity?->currentContract?->status === 'active' ? (int) $userLogged?->entity?->currentContract?->planVersion?->plan?->monthly_value : 0;
                
                $plans = $plans->whereHas('latestVersion', function($query) use ($baseValue) {
                    $query->whereNotNull('monthly_value')
                        ->where('monthly_value', '<>', 0)
                        ->whereNotNull('annual_value')
                        ->where('annual_value', '<>', 0)
                        ->where('monthly_value', '>', $baseValue);
                })->with(['latestVersion' => function($q) {
                    $q->orderBy('monthly_value', 'asc');
                }]);
            }

            return $plans->get();
        }

        return $plans->paginate();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(CreatePlanRequest $request)
    {
        $validated = $request->validated();

        $plan = Plan::create([
            'name' => $validated['name'],
            'active' => $validated['active']
        ]);

        $validated['plan_id'] = $plan->id;
        $validated['image'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['image']));

        $planVersion = PlanVersion::create($validated);
        $planVersion->benefits()->sync($validated['benefits']);

        return $planVersion;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Plan::find($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlanRequest $request, string $id)
    {
        $validated = $request->validated();

        $plan = Plan::find($id);
        $plan->update([
            'name' => $validated['name'],
            'active' => $validated['active']
        ]);

        $validated['plan_id'] = $plan->id;
        
        $oldImage = parse_url($plan->getOriginal('image'), PHP_URL_PATH);

        if ($oldImage && strlen($oldImage) && isset($validated['image']) && $validated['image']) {
            (new DeleteFileS3Service())->execute($oldImage);
        }

        if (isset($validated['image']) && $validated['image']) {
            $validated['image'] = (new RegisterFilesS3Service)->execute((new ConvertToPngService())->execute($validated['image']), 'plans');
        } else {
            $validated['image'] = $plan->image;
        }
        
        $planVersion = PlanVersion::create($validated);
        $planVersion->benefits()->sync($validated['benefits']);

        return $planVersion;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $plan = Plan::find($id);
        $plan->delete();

        return response()->noContent();
    }

    public function planBenefits()
    {
        return PlanBenefit::all();
    }
}

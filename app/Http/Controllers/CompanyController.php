<?php

namespace App\Http\Controllers;

use App\Http\Requests\Company\CreateOrUpdateCompanyRequest;
use App\Http\Requests\Company\IndexCompanyRequest;
use App\Http\Resources\Company\CompanyResourceAll;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Jobs\ImportCompaniesJob;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexCompanyRequest $request)
    {
        $validated = $request->validated();

        if (isset($validated['all'])) {
            return CompanyResourceAll::collection(
                Company::myScope($validated)
                    ->get()
            )->toArray(request());  
        }
         
        return Company::myScope($validated)->paginate(); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateOrUpdateCompanyRequest $request)
    {
        $validated = $request->validated();
        $segmentId = $validated['business_segment_id'] ?? null;
        // remove segment from company payload
        if (array_key_exists('business_segment_id', $validated)) {
            unset($validated['business_segment_id']);
        }

        $company = Company::create($validated);

        // If segment provided, update the related entity (if any)
        if ($segmentId) {
            $entity = $company->entity ?? auth()->user()->entity ?? null;
            if ($entity) {
                $entity->business_segment_id = $segmentId;
                $entity->save();
            }
        }

        return $company;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $company = Company::myScope()->find($id);
        return $company ?? response()->noContent();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();
        $segmentId = $validated['business_segment_id'] ?? null;
        if (array_key_exists('business_segment_id', $validated)) {
            unset($validated['business_segment_id']);
        }

        $company->update($validated);

        if ($segmentId) {
            $entity = $company->entity ?? auth()->user()->entity ?? null;
            if ($entity) {
                $entity->business_segment_id = $segmentId;
                $entity->save();
            }
        }

        return $company;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        return $company->delete();
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt']
        ]);
 
        $userLogged = Auth::user();

        $filename = Str::uuid() . '.' . $request->file('file')->getClientOriginalExtension();
    
        $path = $request->file('file')->storeAs('imports', $filename);
        
        ImportCompaniesJob::dispatch($path, $userLogged->entity_id);

        return response()->json(['message' => 'Sua solicitação está sendo processada']);
    }
}

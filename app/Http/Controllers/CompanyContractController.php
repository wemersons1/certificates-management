<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyContract\CreateOrUpdateCompanyContractRequest;
use App\Http\Requests\CompanyContract\IndexCompanyContractRequest;
use App\Models\CompanyContract;
use App\Services\CompanyContract\CreateCompanyContractService;
use Illuminate\Support\Facades\Auth;

class CompanyContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexCompanyContractRequest $request)
    {
        $validated = $request->validated();
        $userLogged = Auth::user();

        return isset($validated['all']) ? 
            CompanyContract::where('entity_id', $userLogged->entity_id)
                ->when(isset($validated['company_id']), function($query) use ($validated) {
                    return $query->where('company_id', $validated['company_id']);
                })
                ->with(['company', 'status'])
                ->get() : 
            CompanyContract::where('entity_id', $userLogged->entity_id)
                ->when(isset($validated['company_id']), function($query) use ($validated) {
                    return $query->where('company_id', $validated['company_id']);
                })
                ->with(['company', 'status'])
                ->orderBy('created_at', 'desc')
                ->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateOrUpdateCompanyContractRequest $request)
    {
        $createCompanyContractService = new CreateCompanyContractService();
        return $createCompanyContractService->execute($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return CompanyContract::myScope()
                            ->with(['company', 'status'])
                            ->find($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateCompanyContractRequest $request, CompanyContract $companyContract)
    {
        return $companyContract->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompanyContract $companyContract)
    {
        return $companyContract->delete();
    }
} 
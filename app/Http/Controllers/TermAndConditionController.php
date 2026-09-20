<?php

namespace App\Http\Controllers;

use App\Http\Requests\TermAndCondition\CreateOrUpdateTermAndConditionRequest;
use App\Models\TermAndCondition;
use Illuminate\Http\Request;

class TermAndConditionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TermAndCondition::myScope()->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateOrUpdateTermAndConditionRequest $request)
    {
        return TermAndCondition::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(TermAndCondition $termAndCondition)
    {
        return $termAndCondition;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateTermAndConditionRequest $request, TermAndCondition $termAndCondition)
    {
        $termAndCondition->update($request->validated());

        return $termAndCondition;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmailTemplate\CreateOrUpdateEmailTemplateRequest;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EmailTemplate::myScope()
        ->paginate();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(CreateOrUpdateEmailTemplateRequest $request)
    {
        $validated = $request->validated();
        $emailTemplate = EmailTemplate::create($validated);
        $emailTemplate->companies()->sync($validated['companies']);

        return $emailTemplate;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return EmailTemplate::myScope()->with(['companies'])->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateEmailTemplateRequest $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validated();
        $emailTemplate->update($validated);
        $emailTemplate->companies()->sync($validated['companies']);

        return $emailTemplate;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

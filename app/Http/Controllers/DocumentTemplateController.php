<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentTemplate\CreateDocumentTemplateRequest;
use App\Http\Requests\DocumentTemplate\IndexDocumentTemplatesRequest;
use App\Http\Requests\DocumentTemplate\UpdateDocumentTemplateRequest;
use App\Jobs\ApplyInCourseMaskWithGeminiJob;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateType;

class DocumentTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexDocumentTemplatesRequest $request)
    {
        $filters = $request->validated();

        $documentTemplates = DocumentTemplate::with(['latestVersion.type'])
        ->myScope($filters);

        if (isset($filters['type_id'])) {
            $documentTemplates->wherehas('latestVersion.type', function($query) use($filters) {
                $query->where('type_id', $filters['type_id']);
            });
        }

        if (isset($filters['all'])) {
            return $documentTemplates->get();
        }
        return $documentTemplates->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateDocumentTemplateRequest $request)
    {
        $validated = $request->validated();

        $documentTemplate = DocumentTemplate::create(['name' => $validated['name']]);
        $validated['document_template_id'] = $documentTemplate->id;

        $documentTemplateVersion = $documentTemplate->versions()->create($validated);

        ApplyInCourseMaskWithGeminiJob::dispatch($documentTemplateVersion->id);

        return $documentTemplate;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return DocumentTemplate::with(['latestVersion.type'])
        ->myScope()
        ->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDocumentTemplateRequest $request, string $id)
    {
        $validated = $request->validated();

        $documentTemplate = DocumentTemplate::myScope()
        ->findOrFail($id);

        $documentTemplate->update(['name' => $validated['name']]);
        $documentTemplateVersion = $documentTemplate->versions()->create($validated);

        ApplyInCourseMaskWithGeminiJob::dispatch($documentTemplateVersion->id);


        return $documentTemplateVersion;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $documentTemplate = DocumentTemplate::myScope()
        ->findOrFail($id);

        $documentTemplate->delete();

        return response()->noContent();
    }

    public function templateTypes()
    {
        return DocumentTemplateType::all();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplateFrame;
use Illuminate\Http\Request;

class DocumentTemplateFrameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $documentTemplateFrames = DocumentTemplateFrame::myScope();

        return $request->all ? $documentTemplateFrames->get() : $documentTemplateFrames->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return DocumentTemplateFrame::create([
            'frame' => $request->frame,
            'back_frame' => $request->back_frame,
            'is_top_only' => $request->is_top_only
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $documentTemplate = DocumentTemplateFrame::myScope()->find($id);
  
        $documentTemplate->delete();
        
        return response()->noContent();
    }
}

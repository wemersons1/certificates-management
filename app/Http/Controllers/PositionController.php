<?php

namespace App\Http\Controllers;

use App\Http\Requests\Position\CreatePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $positions = Position::with(['courses'])->myScope();
        
        if ($request->all) {
            return $positions->with(['courses.certificateTemplate.versions', 'courses.presenceListTemplate.versions', 'courses.authorizationTemplate.versions'])->get();
        }

        return $positions->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePositionRequest $request)
    {
        $validated = $request->validated();

        $position = Position::with(['courses'])->create($validated);
        
        if (isset($validated['courses'])) {
            $position->courses()->sync($validated['courses']);
        }

        return $position;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Position::with(['courses'])->myScope()->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePositionRequest $request, string $id)
    {
        $validated = $request->validated();

        $position = Position::with(['courses'])->myScope()->findOrFail($id);

        $position->update($validated);

        if (isset($validated['courses'])) {
            $position->courses()->sync($validated['courses']);
        }
        
        return $position;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $position = Position::myScope()->findOrFail($id);
        
        $position->delete();

        return response()->noContent();
    }

    public function verifyName(Request $request)
    {
        return Position::myScope()
        ->where('name', $request->name)
        ->first();
    }
}

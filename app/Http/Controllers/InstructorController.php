<?php

namespace App\Http\Controllers;

use App\Http\Requests\Instructor\CreateInstructorRequest;
use App\Http\Requests\Instructor\IndexInstructorRequest;
use App\Http\Requests\Instructor\UpdateInstructorRequest;
use App\Models\Instructor;
use App\Services\Instrutor\CreateInstrutorService;
use App\Services\Instrutor\UpdateInstrutorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class InstructorController extends Controller
{
    public function index(IndexInstructorRequest $request) 
    {
        $validated = $request->validated();
        $instructors = Instructor::myScope($validated);

        if(isset($validated['all'])) {
            return $instructors->get();
        } 

        return $instructors->paginate();
    }

    public function store(CreateInstructorRequest $request) 
    {
        $createInstrutorService = new CreateInstrutorService();

        return $createInstrutorService->execute($request->validated());
    }


    public function update(UpdateInstructorRequest $request, $id)
    {
        $updateInstrutorService = new UpdateInstrutorService();

        return $updateInstrutorService->execute($request->validated(), $id);
    }


    public function show($id) 
    {
        $instructor = Instructor::myScope()->findOrFail($id);
     
        return response()->json($instructor->setAppends(['signature_base64', 'stamp_base64']));
    }

    public function destroy($id) 
    {
       Instructor::myScope()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function verifyName(Request $request)
    {
        return Instructor::myScope()
        ->where('name', $request->name)
        ->first();
    }
}

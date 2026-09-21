<?php

namespace App\Http\Controllers;

use App\Http\Requests\Course\CreateCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Models\Course;
use App\Models\DocumentTemplate;
use App\Services\Template\CourseTemplateUploadService;
use Illuminate\Http\Request;
use App\Services\Files\R2Path;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CourseController extends Controller
{
    public function store(CreateCourseRequest $request) {
        $validated = $request->validated();

        if (!empty($validated['certificate_id'])) {
            $entityId = (int) ($request->user()?->entity_id ?? 0);
            if ($entityId <= 0) {
                throw new AccessDeniedHttpException('Usuario sem entidade vinculada.');
            }

            DocumentTemplate::query()
                ->where('entity_id', $entityId)
                ->findOrFail($validated['certificate_id']);
        }

        $course = Course::create($validated);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('courses/attachments', 's3');
                $fullUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
                $course->courseFiles()->create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $fullUrl,
                ]);
            }
        }

        return $course->load('courseFiles');
    }

    public function index(Request $request) 
    {
        $query = Course::with(['entity', 'courseFiles'])->orderBy('name', 'asc');
        if ($request->only_deleted && $request->user()?->isMaster()) {
            $query->onlyTrashed();
        }
        $courses = $query->myScope($request->all());

        if ($request->name) {
            $courses = $courses->where('name', 'LIKE', '%'.$request->name.'%');
        }

        if ($request->entity_id) {
            $courses = $courses->where('entity_id', $request->entity_id);
        }

        if ($request->has('has_files') && $request->has_files !== null && $request->has_files !== '') {
            if ($request->has_files === 'yes' || $request->has_files === '1' || $request->has_files === 'true') {
                $courses = $courses->has('courseFiles');
            } else {
                $courses = $courses->doesntHave('courseFiles');
            }
        }

        if ($request->company_id) {
            $company = \App\Models\Company::find($request->company_id);
            if ($company) {
                $courses = $courses->where('entity_id', $company->entity_id);
            }
        }

        if ($request->all) {
            $queryAll = Course::with(['entity', 'certificateTemplate', 'authorizationTemplate', 'presenceListTemplate', 'courseFiles'])->orderBy('name', 'asc');
            if ($request->only_deleted && $request->user()?->isMaster()) {
                $queryAll->onlyTrashed();
            }
            return $queryAll->myScope($request->all())
                ->when($request->entity_id, function($q) use ($request) {
                    return $q->where('entity_id', $request->entity_id);
                })
                ->when($request->company_id, function($q) use ($request) {
                    $company = \App\Models\Company::find($request->company_id);
                    return $company ? $q->where('entity_id', $company->entity_id) : $q;
                })
                ->when($request->has('has_files') && $request->has_files !== null && $request->has_files !== '', function($q) use ($request) {
                    if ($request->has_files === 'yes' || $request->has_files === '1' || $request->has_files === 'true') {
                        return $q->has('courseFiles');
                    } else {
                        return $q->doesntHave('courseFiles');
                    }
                })
                ->get();
        } 

        return $courses->paginate();
    }

    public function show($id) {
        return Course::myScope()
        ->with(['certificateTemplate.latestVersion.type', 'courseFiles'])
        ->findOrFail($id);
    }

    public function update(UpdateCourseRequest $request, $id) 
    {
        $course = Course::myScope()->findOrFail($id);
        
        $course->update($request->validated());

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('courses/attachments', 's3');
                $fullUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
                $course->courseFiles()->create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $fullUrl,
                ]);
            }
        }

        return $course->load('courseFiles');
    }

    public function destroy($id) 
    {
        $course = Course::myScope()->findOrFail($id);
        
        foreach ($course->courseFiles as $file) {
            try {
                \Illuminate\Support\Facades\Storage::disk('s3')->delete($this->getRelativeS3Path($file->path));
            } catch (\Exception $e) {}
            $file->delete();
        }

        $course->delete();

        return response()->noContent();
    }

    public function deleteFile($id, $fileId)
    {
        $course = Course::myScope()->findOrFail($id);
        $file = $course->courseFiles()->findOrFail($fileId);

        try {
            \Illuminate\Support\Facades\Storage::disk('s3')->delete($this->getRelativeS3Path($file->path));
        } catch (\Exception $e) {}

        $file->delete();

        return response()->noContent();
    }

    public function uploadFiles(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('[CourseController::uploadFiles] hit', [
            'course_id' => $id,
            'files_keys' => array_keys($request->allFiles()),
            'all_keys' => array_keys($request->all()),
            'has_files' => $request->hasFile('files'),
        ]);

        $course = Course::myScope()->findOrFail($id);

        $uploadedFiles = [];
        $files = $request->file('files');

        if ($files) {
            \Illuminate\Support\Facades\Log::info('[CourseController::uploadFiles] processing files', [
                'is_array' => is_array($files),
            ]);

            if (is_array($files)) {
                foreach ($files as $file) {
                    $path = $file->store('courses/attachments', 's3');
                    $fullUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
                    \Illuminate\Support\Facades\Log::info('[CourseController::uploadFiles] stored array file', [
                        'name' => $file->getClientOriginalName(),
                        'path' => $fullUrl,
                    ]);
                    $courseFile = $course->courseFiles()->create([
                        'name' => $file->getClientOriginalName(),
                        'path' => $fullUrl,
                    ]);
                    $uploadedFiles[] = $courseFile;
                }
            } else {
                $path = $files->store('courses/attachments', 's3');
                $fullUrl = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
                \Illuminate\Support\Facades\Log::info('[CourseController::uploadFiles] stored single file', [
                    'name' => $files->getClientOriginalName(),
                    'path' => $fullUrl,
                ]);
                $courseFile = $course->courseFiles()->create([
                    'name' => $files->getClientOriginalName(),
                    'path' => $fullUrl,
                ]);
                $uploadedFiles[] = $courseFile;
            }
        } else {
            \Illuminate\Support\Facades\Log::warning('[CourseController::uploadFiles] no files resolved in request');
        }

        return response()->json($uploadedFiles, 201);
    }

    public function importTemplate(Request $request, CourseTemplateUploadService $uploadService)
    {
        $validated = $request->validate([
            'template_file' => ['required', 'file', 'mimes:pdf,docx', 'max:20480'],
            'course_id'     => ['nullable', 'integer', 'exists:courses,id'],
        ]);

        $result = $uploadService->handle(
            $validated['template_file'],
            $validated['course_id'] ?? null
        );

        return response()->json($result, 201);
    }

    public function downloadFile($id, $fileId, \Illuminate\Http\Request $request)
    {
        $course = Course::myScope()->findOrFail($id);
        $file = $course->courseFiles()->findOrFail($fileId);

        $relativeS3Path = $this->getRelativeS3Path($file->path);

        if (!\Illuminate\Support\Facades\Storage::disk('s3')->exists($relativeS3Path)) {
            return response()->json(['message' => 'Arquivo não encontrado no storage'], 404);
        }

        $fileContents = \Illuminate\Support\Facades\Storage::disk('s3')->get($relativeS3Path);
        
        $mimeType = 'application/octet-stream';
        $extension = strtolower(pathinfo($file->name, PATHINFO_EXTENSION));
        if ($extension === 'pdf') {
            $mimeType = 'application/pdf';
        } elseif ($extension === 'docx') {
            $mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } elseif ($extension === 'doc') {
            $mimeType = 'application/msword';
        }

        $disposition = $request->query('inline') ? 'inline' : 'attachment';

        return response($fileContents)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', $disposition . '; filename="' . $file->name . '"')
            ->header('Content-Length', strlen($fileContents))
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    private function getRelativeS3Path(string $path): string
    {
        return R2Path::normalize($path);
    }
}

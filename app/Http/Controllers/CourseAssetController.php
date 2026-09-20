<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseLogo;
use App\Models\CourseSignature;
use App\Services\Files\RegisterFilesS3Service;
use Illuminate\Http\Request;

class CourseAssetController extends Controller
{
    // ─── LOGO ────────────────────────────────────────────────────────────────

    /**
     * GET /courses/{courseId}/logo
     * Returns the logo record (or null) for the course.
     */
    public function getLogo(int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);
        return response()->json($course->logo);
    }

    /**
     * PUT /courses/{courseId}/logo
     * Create or update the logo for the course.
     * Accepts: { url, x, y, width }
     * If url is a base64 image it will be uploaded to S3 first.
     */
    public function saveLogo(Request $request, int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);

        $validated = $request->validate([
            'url'   => 'required|string',
            'x'     => 'required|numeric',
            'y'     => 'required|numeric',
            'width' => 'required|integer|min:1',
        ]);

        // If base64, upload to S3 and replace with URL
        if (str_starts_with($validated['url'], 'data:image/')) {
            $validated['url'] = (new RegisterFilesS3Service)->execute($validated['url'], 'course-logos');
        }

        $logo = CourseLogo::updateOrCreate(
            ['course_id' => $course->id],
            [
                'url'   => $validated['url'],
                'x'     => $validated['x'],
                'y'     => $validated['y'],
                'width' => $validated['width'],
            ]
        );

        return response()->json($logo, 200);
    }

    /**
     * DELETE /courses/{courseId}/logo
     * Remove the logo from the course.
     */
    public function deleteLogo(int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);
        $course->logo()->delete();
        return response()->noContent();
    }

    // ─── SIGNATURES ──────────────────────────────────────────────────────────

    /**
     * GET /courses/{courseId}/signatures
     * Returns all signature records for the course.
     */
    public function getSignatures(int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);
        return response()->json($course->signatures()->orderBy('id')->get());
    }

    /**
     * POST /courses/{courseId}/signatures
     * Add a new signature to the course.
     * Accepts: { url, x, y, width, page }
     * If url is a base64 image it will be uploaded to S3 first.
     */
    public function addSignature(Request $request, int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);

        $validated = $request->validate([
            'url'   => 'required|string',
            'x'     => 'required|numeric',
            'y'     => 'required|numeric',
            'width' => 'required|integer|min:1',
            'page'  => 'required|integer|min:1',
        ]);

        // If base64, upload to S3 and replace with URL
        if (str_starts_with($validated['url'], 'data:image/')) {
            $validated['url'] = (new RegisterFilesS3Service)->execute($validated['url'], 'course-signatures');
        }

        $sig = $course->signatures()->create($validated);

        return response()->json($sig, 201);
    }

    /**
     * PUT /courses/{courseId}/signatures/{sigId}
     * Update a signature record (position / dimensions).
     */
    public function updateSignature(Request $request, int $courseId, int $sigId)
    {
        $course = Course::myScope()->findOrFail($courseId);
        $sig    = $course->signatures()->findOrFail($sigId);

        $validated = $request->validate([
            'url'   => 'sometimes|string',
            'x'     => 'sometimes|numeric',
            'y'     => 'sometimes|numeric',
            'width' => 'sometimes|integer|min:1',
            'page'  => 'sometimes|integer|min:1',
        ]);

        $sig->update($validated);

        return response()->json($sig);
    }

    /**
     * DELETE /courses/{courseId}/signatures/{sigId}
     * Remove a specific signature from the course.
     */
    public function deleteSignature(int $courseId, int $sigId)
    {
        $course = Course::myScope()->findOrFail($courseId);
        $course->signatures()->findOrFail($sigId)->delete();
        return response()->noContent();
    }

    /**
     * PUT /courses/{courseId}/signatures/sync
     * Full sync: replaces all signature records for the course with the given list.
     * Accepts: { signatures: [{ id?, url, x, y, width, page }] }
     * Existing records not in the list are deleted; new base64 images are uploaded.
     */
    public function syncSignatures(Request $request, int $courseId)
    {
        $course = Course::myScope()->findOrFail($courseId);

        $validated = $request->validate([
            'signatures'        => 'required|array',
            'signatures.*.id'   => 'nullable|integer',
            'signatures.*.url'  => 'required|string',
            'signatures.*.x'    => 'required|numeric',
            'signatures.*.y'    => 'required|numeric',
            'signatures.*.width'=> 'required|integer|min:1',
            'signatures.*.page' => 'required|integer|min:1',
        ]);

        $incoming    = $validated['signatures'];
        $incomingIds = collect($incoming)->pluck('id')->filter()->values()->all();

        // Delete removed signatures
        $course->signatures()->whereNotIn('id', $incomingIds)->delete();

        $result = [];
        foreach ($incoming as $item) {
            // Upload base64 if needed
            if (str_starts_with($item['url'], 'data:image/')) {
                $item['url'] = (new RegisterFilesS3Service)->execute($item['url'], 'course-signatures');
            }

            if (!empty($item['id'])) {
                $sig = $course->signatures()->find($item['id']);
                if ($sig) {
                    $sig->update($item);
                    $result[] = $sig->fresh();
                    continue;
                }
            }

            $result[] = $course->signatures()->create($item);
        }

        return response()->json($result);
    }
}

<?php

namespace App\Services\Document;

use App\Models\Course;
use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\PresenceList;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GenerateDocumentsService
{
    public function __construct(private ?User $userLogged, private $presenceList)
    {
        $this->userLogged = $this->userLogged;
        $this->presenceList = $this->presenceList;
    }

    public function execute($validated)
    {
        return DB::transaction(function () use ($validated) {
            foreach ($validated['courses'] as $courseItem) {
                $course = Course::myScope([], $this->userLogged)
                ->with(['certificateTemplate.latestVersion'])
                ->find($courseItem['course_id']);
                
                if (isset($courseItem['instructors']) && $this->presenceList) {
                    $instructorsId = collect($courseItem['instructors'])->pluck('id')->toArray();
                    $this->presenceList->instructors()->sync($instructorsId);
                }
                
                $this->createDocument($validated, $this->presenceList?->id, $courseItem, $course);        
            }

            return $this->presenceList;
        });
    }

    private function createDocument(&$validated, $presenceListId, &$courseRequest, &$courseBD)
    {
        $templateCertificate = DocumentTemplate::myScope([], $this->userLogged)->find($courseBD->certificate_id);
        $versionCertificate = $templateCertificate->versions()->latest()->first();

        $documentsData = [];

        foreach ($courseRequest['employees'] as $employee) {
            $documentsData[] = [
                'uuid' => Str::uuid(),
                'content_program' => $courseBD->content_program,
                'number_of_hours_studied' => $courseRequest['number_of_hours_studied'],
                'date_init_validate' => $courseRequest['date_init_validate'] ?? null,
                'date_end_validate' => $courseRequest['date_end_validate'] ?? null,
                'employee_id' => $employee['id'],
                'position_id' => $validated['position_id'] ?? null,
                'course_id' => $courseRequest['course_id'],
                'certificate_template_version_id' => $versionCertificate->id,
                'authorization_template_version_id' => null,
                'issue_date' => $courseRequest['issue_date'],
                'presence_list_id' => $presenceListId,
                'registered_by_id' => $this->userLogged->id,
                'entity_id' => $this->userLogged->entity_id,
                'created_at' => now(),
                'updated_at' => now(),
                'city_name' => $validated['city_name'] ?? null,
                'company_name' => $validated['company_name'] ?? null,
                'company_representative' => $validated['company_representative'] ?? null,
            ];
        }

        $chunkSize = 100;

        foreach (array_chunk($documentsData, $chunkSize) as $chunk) {
            Document::insert($chunk);
        }
    }
}


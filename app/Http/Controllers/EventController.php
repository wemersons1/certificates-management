<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventCheckinLink;
use App\Models\PresenceList;
use App\Models\User;
use App\Services\Document\GenerateDocumentsService;
use App\Services\Document\SendNotificationMailService;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query()->myScope()
            ->with(['course', 'instructors'])
            ->withCount([
                'checkinLinks as generated_certificates_count' => function ($subQuery) {
                    $subQuery->whereNotNull('generated_document_id');
                }
            ]);

        if ($request->filled('id')) {
            $query->where('id', $request->input('id'));
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->input('course_id'));
        }



        if ($request->filled('issue_date_from')) {
            $query->whereDate('issue_date', '>=', $request->input('issue_date_from'));
        }

        if ($request->filled('issue_date_to')) {
            $query->whereDate('issue_date', '<=', $request->input('issue_date_to'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            if (!empty($search)) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('title', 'like', "%{$search}%")
                        ->orWhereHas('course', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }
        }

        $events = $query->reorder('id', 'desc')->paginate();
        $events->getCollection()->transform(function (Event $event) {
            $event->setAttribute('has_generated_certificates', (int) ($event->generated_certificates_count ?? 0) > 0);
            return $event;
        });

        return $events;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'instructor_ids' => 'required|array|min:1',
            'instructor_ids.*' => 'exists:instructors,id',
            'number_of_hours' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'company_representative' => 'nullable|string|max:255',
            'city_name' => 'nullable|string|max:255',
            'date_init_validate' => 'nullable|date',
            'date_end_validate' => 'nullable|date',
            'issue_date' => 'required|date',
            'periods' => 'nullable|array',
        ]);

        $course = \App\Models\Course::findOrFail($validated['course_id']);
        $instructors = \App\Models\Instructor::whereIn('id', $validated['instructor_ids'])->pluck('name')->toArray();
        $instructorNames = implode(', ', $instructors);
        $issueDate = Carbon::parse($validated['issue_date'])->format('d/m/Y');

        $validated['title'] = "{$course->name} - {$issueDate} - {$instructorNames}";

        $event = Event::create($validated);

        if (isset($validated['instructor_ids'])) {
            $event->instructors()->sync($validated['instructor_ids']);
        }

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Event::query()->myScope()
            ->withCount([
                'checkinLinks as generated_certificates_count' => function ($subQuery) {
                    $subQuery->whereNotNull('generated_document_id');
                }
            ])
            ->findOrFail($id);
        $event->load(['course', 'instructors']);
        $event->setAttribute('has_generated_certificates', (int) ($event->generated_certificates_count ?? 0) > 0);
        return $event;
    }

    public function showByUuid($uuid)
    {
        $event = Event::with(['course', 'instructors'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        return response()->json($event);
    }

    public function issueCheckinLinkByCode(Request $request, $code)
    {
        $event = Event::with(['course', 'instructors'])
            ->where('checkin_code', strtoupper($code))
            ->firstOrFail();

        $link = EventCheckinLink::create([
            'event_id' => $event->id,
            'token' => (string) Str::uuid(),
            'issued_ip' => $request->ip(),
            'issued_user_agent' => substr((string) $request->userAgent(), 0, 65535),
        ]);

        return response()->json([
            'token' => $link->token,
            'redirect_url' => url('/public/events/checkin/' . $link->token),
        ]);
    }

    public function issuePublicCheckinLink(Request $request, $uuid)
    {
        $event = Event::with(['course', 'instructors'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        $link = EventCheckinLink::create([
            'event_id' => $event->id,
            'token' => (string) Str::uuid(),
            'issued_ip' => $request->ip(),
            'issued_user_agent' => substr((string) $request->userAgent(), 0, 65535),
        ]);

        return response()->json([
            'token' => $link->token,
            'redirect_url' => url('/public/events/checkin/' . $link->token),
        ]);
    }

    public function showPublicCheckinByToken($token)
    {
        $checkinLink = EventCheckinLink::with(['event.course', 'event.instructors', 'generatedDocument'])
            ->where('token', $token)
            ->firstOrFail();

        return response()->json([
            'already_used' => (bool) $checkinLink->used_at,
            'message' => $checkinLink->used_at ? 'Este link já foi utilizado anteriormente. Você pode baixar novamente o certificado e reenviar por e-mail.' : null,
            'used_at' => $checkinLink->used_at,
            'used_by_name' => $checkinLink->used_by_name,
            'used_by_email' => $checkinLink->used_by_email,
            'document_uuid' => $checkinLink->generatedDocument?->uuid,
            'download_url' => $checkinLink->generatedDocument?->uuid
                ? url('/api/public/documents/' . $checkinLink->generatedDocument->uuid . '/download')
                : null,
            'event' => $checkinLink->event,
        ]);
    }

    public function publicCheckinByToken(Request $request, $token)
    {
        if (!$request->filled('email')) {
            $request->merge(['email' => null]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        return DB::transaction(function () use ($token, $validated, $request) {
            $checkinLink = EventCheckinLink::where('token', $token)
                ->lockForUpdate()
                ->firstOrFail();

            if ($checkinLink->used_at) {
                return response()->json([
                    'message' => 'Este link único de check-in já foi utilizado e não pode gerar outro certificado.',
                ], 422);
            }

            $event = Event::with(['course', 'instructors'])
                ->findOrFail($checkinLink->event_id);

            if ($event->certificates_closed) {
                return response()->json([
                    'message' => 'A emissão de certificados para este evento foi encerrada pelo organizador.',
                ], 422);
            }

            if (!$event->course_id || !$event->course) {
                return response()->json([
                    'message' => 'Este evento não possui curso vinculado para emissão de certificado.'
                ], 422);
            }

            if (!$event->entity_id) {
                return response()->json([
                    'message' => 'Este evento não possui entidade vinculada para emissão de certificado.'
                ], 422);
            }



            $normalizedName = $this->normalizePersonName($validated['name']);

            $existingGeneratedLink = EventCheckinLink::with(['generatedDocument.employee.company', 'generatedDocument.entity.config'])
                ->where('event_id', $event->id)
                ->whereNotNull('generated_document_id')
                ->whereRaw('LOWER(TRIM(used_by_name)) = ?', [$normalizedName])
                ->latest('id')
                ->first();

            if ($existingGeneratedLink && $existingGeneratedLink->generatedDocument) {
                $emailForReuse = $validated['email'] ?? $existingGeneratedLink->used_by_email;

                if (!empty($validated['email']) && empty($existingGeneratedLink->used_by_email)) {
                    $existingGeneratedLink->update([
                        'used_by_email' => $validated['email'],
                    ]);
                }

                if (!empty($emailForReuse)) {
                    $sendNotificationMailService = new SendNotificationMailService();
                    $sendNotificationMailService->execute([
                        'email' => $emailForReuse,
                        'send_authorization' => false,
                        'send_certificate' => true,
                        'send_presence_list' => false,
                    ], $existingGeneratedLink->generatedDocument);
                }

                $checkinLink->update([
                    'used_at' => now(),
                    'used_by_name' => $validated['name'],
                    'used_by_email' => $emailForReuse,
                    'generated_document_id' => $existingGeneratedLink->generated_document_id,
                ]);

                return response()->json([
                    'message' => 'Identificamos que este certificado já foi gerado para este evento. Estamos reaproveitando o documento existente para você.',
                    'document_uuid' => $existingGeneratedLink->generatedDocument->uuid,
                    'download_url' => url('/api/public/documents/' . $existingGeneratedLink->generatedDocument->uuid . '/download'),
                    'used_by_email' => $emailForReuse,
                ]);
            }



            $userLogged = User::where('entity_id', $event->entity_id)
                ->orderByDesc('is_main_user')
                ->orderBy('id')
                ->first();

            if (!$userLogged) {
                return response()->json([
                    'message' => 'Nenhum usuário responsável foi encontrado para emitir o certificado.'
                ], 422);
            }

            $employee = $this->resolveOrCreateEmployee($event, $validated['name'], $validated['email'] ?? null);
            $document = $this->generateDocumentForEventCheckin($event, $employee, $userLogged);

            $document->load(['employee.company', 'entity.config']);

            if (!empty($validated['email'])) {
                $sendNotificationMailService = new SendNotificationMailService();
                $sendNotificationMailService->execute([
                    'email' => $validated['email'],
                    'send_authorization' => false,
                    'send_certificate' => true,
                    'send_presence_list' => false,
                ], $document);
            }

            $checkinLink->update([
                'used_at' => now(),
                'used_by_name' => $validated['name'],
                'used_by_email' => $validated['email'] ?? null,
                'generated_document_id' => $document->id,
            ]);

            $message = !empty($validated['email'])
                ? 'Check-in realizado com sucesso! Seu certificado está sendo preparado e enviado para o e-mail informado.'
                : 'Check-in realizado com sucesso! Seu certificado está pronto para download.';

            return response()->json([
                'message' => $message,
                'document_uuid' => $document->uuid,
                'download_url' => url('/api/public/documents/' . $document->uuid . '/download'),
                'used_by_email' => $validated['email'] ?? null,
            ]);
        });
    }

    private function normalizePersonName(string $name): string
    {
        return mb_strtolower(trim($name));
    }

    public function resendCertificateByToken($token)
    {
        $checkinLink = EventCheckinLink::with(['generatedDocument.employee.company', 'generatedDocument.entity.config'])
            ->where('token', $token)
            ->firstOrFail();

        if (!$checkinLink->used_at || !$checkinLink->generated_document_id) {
            return response()->json([
                'message' => 'Ainda não existe certificado gerado para este link.'
            ], 422);
        }

        if (empty($checkinLink->used_by_email)) {
            return response()->json([
                'message' => 'Nenhum e-mail foi informado no check-in anterior para reenvio.'
            ], 422);
        }

        if (!$checkinLink->generatedDocument) {
            return response()->json([
                'message' => 'Certificado não encontrado para reenvio.'
            ], 422);
        }

        $sendNotificationMailService = new SendNotificationMailService();
        $sendNotificationMailService->execute([
            'email' => $checkinLink->used_by_email,
            'send_authorization' => false,
            'send_certificate' => true,
            'send_presence_list' => false,
        ], $checkinLink->generatedDocument);

        return response()->json([
            'message' => 'Certificado reenviado com sucesso para o e-mail informado anteriormente.',
            'used_by_email' => $checkinLink->used_by_email,
        ]);
    }

    private function resolveOrCreateEmployee(Event $event, string $name, ?string $email): Employee
    {
        $employeeQuery = Employee::where('entity_id', $event->entity_id)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)]);

        if (!empty($email)) {
            $employeeQuery->whereRaw('LOWER(email) = ?', [mb_strtolower($email)]);
        }

        $employee = $employeeQuery->first();

        if ($employee) {
            if (!empty($email) && empty($employee->email)) {
                $employee->update(['email' => $email]);
            }
            return $employee;
        }

        return Employee::create([
            'entity_id' => $event->entity_id,
            'name' => $name,
            'email' => $email,
        ]);
    }

    private function generateDocumentForEventCheckin(Event $event, Employee $employee, User $userLogged): Document
    {
        $templatePresenceList = DocumentTemplate::where('entity_id', $event->entity_id)
            ->find($event->course?->presence_list_id ?? null);

        $versionPresenceList = $templatePresenceList?->versions()?->latest()?->first();

        $eventPeriods = $event->periods ?? [];
        $fallbackDate = $event->issue_date ?? now()->toDateString();
        $periods = !empty($eventPeriods)
            ? array_map(fn($p) => ['start_date' => $p['start_date'], 'end_date' => $p['end_date']], $eventPeriods)
            : [['start_date' => $fallbackDate, 'end_date' => $fallbackDate]];

        $firstPeriodStart = $periods[0]['start_date'] ?? $fallbackDate;
        $numberOfHours = $event->number_of_hours ?? $event->course->number_of_hours_studied ?? 0;
        $dateInitValidate = $event->date_init_validate ?? $firstPeriodStart;
        $dateEndValidate = $event->date_end_validate ?? Carbon::parse($firstPeriodStart)->addYear()->toDateString();
        $issueDate = $event->issue_date ?? $firstPeriodStart;

        $presenceList = PresenceList::create([
            'uuid' => Str::uuid(),
            'entity_id' => $event->entity_id,
            'number_of_hours_studied' => $numberOfHours,
            'course_period' => json_encode($periods),
            'course_id' => $event->course_id,
            'presence_list_template_version_id' => $versionPresenceList?->id,
            'city_id' => null,
        ]);

        $payload = [
            'company_name' => $event->company_name,
            'company_representative' => $event->company_representative,
            'city_name' => $event->city_name,
            'courses' => [
                [
                    'course_id' => $event->course_id,
                    'number_of_hours_studied' => $numberOfHours,
                    'periods' => $periods,
                    'date_init_validate' => $dateInitValidate,
                    'date_end_validate' => $dateEndValidate,
                    'issue_date' => $issueDate,
                    'instructors' => $event->instructors->map(fn ($item) => ['id' => $item->id])->values()->toArray(),
                    'employees' => [
                        ['id' => $employee->id],
                    ],
                ],
            ],
        ];

        $generateDocumentsService = new GenerateDocumentsService($userLogged, $presenceList);
        $generateDocumentsService->execute($payload);

        $document = Document::where('presence_list_id', $presenceList->id)
            ->where('employee_id', $employee->id)
            ->latest('id')
            ->first();

        if (!$document) {
            abort(500, 'Não foi possível gerar o certificado para este check-in.');
        }

        return $document;
    }

    public function publicDownloadCertificate($uuid)
    {
        $document = Document::with(['course', 'employee.company'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        $client = new Client();
        $rendererUrl = 'http://renderer:3000/render-pdf';

        $requestBody = [
            'json' => [
                'html' => $document->certificate_template_mounted,
            ],
        ];

        $response = $client->post($rendererUrl, $requestBody);
        $responseData = json_decode($response->getBody()->getContents(), true);

        if (!isset($responseData['base64'])) {
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }

        $pdfData = base64_decode($responseData['base64']);

        return Response::make($pdfData, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="CERTIFICADO.pdf"',
            'Content-Length' => strlen($pdfData),
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::query()->myScope()->findOrFail($id);

        $validated = $request->validate([
            'course_id' => 'sometimes|exists:courses,id',
            'instructor_ids' => 'array',
            'instructor_ids.*' => 'exists:instructors,id',
            'number_of_hours' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'company_representative' => 'nullable|string|max:255',
            'city_name' => 'nullable|string|max:255',
            'date_init_validate' => 'nullable|date',
            'date_end_validate' => 'nullable|date',
            'issue_date' => 'sometimes|date',
            'periods' => 'nullable|array',
        ]);

        $courseId = $validated['course_id'] ?? $event->course_id;
        $instructorIds = $validated['instructor_ids'] ?? $event->instructors->pluck('id')->toArray();
        $issueDateRaw = $validated['issue_date'] ?? $event->issue_date;

        $course = \App\Models\Course::findOrFail($courseId);
        $instructors = \App\Models\Instructor::whereIn('id', $instructorIds)->pluck('name')->toArray();
        $instructorNames = implode(', ', $instructors);
        $issueDateFormatted = Carbon::parse($issueDateRaw)->format('d/m/Y');

        $validated['title'] = "{$course->name} - {$issueDateFormatted} - {$instructorNames}";

        $event->update($validated);

        if (isset($validated['instructor_ids'])) {
            $event->instructors()->sync($validated['instructor_ids']);
        }

        return response()->json($event);
    }

    public function toggleCertificatesClose($id)
    {
        $event = Event::query()->myScope()->findOrFail($id);
        $event->update(['certificates_closed' => !$event->certificates_closed]);
        return response()->json(['certificates_closed' => $event->certificates_closed]);
    }

    public function destroy($id)
    {
        $event = Event::query()->myScope()->findOrFail($id);

        $event->delete();
        return response()->noContent();
    }
}

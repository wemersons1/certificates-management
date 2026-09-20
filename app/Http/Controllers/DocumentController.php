<?php

namespace App\Http\Controllers;

use App\Http\Requests\Document\GenerateDocumentsRequest;
use App\Http\Requests\Document\IndexDocumentRequest;
use App\Http\Resources\Document\DocumentResource;
use App\Jobs\GenerateDocumentsJob;
use App\Jobs\SendEmailBatchJob;
use App\Mail\SendMailNewGenerateDocuments;
use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\EventCheckinLink;
use App\Services\Document\GenerateDocumentsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\PresenceList;
use App\Services\Document\SendNotificationMailBatchService;
use App\Services\Document\SendNotificationMailService;
use GuzzleHttp\Client; // Importação do cliente Guzzle
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    public function store(GenerateDocumentsRequest $request)
    {
        $userLogged = Auth::user();
        $validated = $request->validated();

        $courseRequest = $validated['courses'][0];
        $totalEmployees = count($courseRequest['employees']);

        $creditService = new \App\Services\Credit\CreditManagerService();
        $availableBalance = $creditService->getAvailableBalance($userLogged);

        if ($availableBalance <= 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'credits' => ["You only have 0 credits available. Please upgrade your plan."]
            ]);
        }

        if ($availableBalance < $totalEmployees) {
            $employeesToProcess = array_slice($courseRequest['employees'], 0, $availableBalance);
            $remainingEmployees = array_slice($courseRequest['employees'], $availableBalance);

            $recoveryData = [
                'course_id' => $courseRequest['course_id'],
                'original_config' => [
                    'city_name' => $validated['city_name'] ?? null,
                    'company_name' => $validated['company_name'] ?? null,
                    'company_representative' => $validated['company_representative'] ?? null,
                    'city_id' => $validated['city_id'] ?? null,
                    'company_id' => $validated['company_id'] ?? null,
                    'position' => $validated['position'] ?? null,
                    'number_of_hours_studied' => $courseRequest['number_of_hours_studied'] ?? null,
                    'periods' => $courseRequest['periods'] ?? [],
                    'date_init_validate' => $courseRequest['date_init_validate'] ?? null,
                    'date_end_validate' => $courseRequest['date_end_validate'] ?? null,
                    'instructors' => $courseRequest['instructors'] ?? [],
                    'issue_date' => $courseRequest['issue_date'] ?? null,
                ],
                'remaining_employees' => $remainingEmployees
            ];

            $validated['courses'][0]['employees'] = $employeesToProcess;

            $templatePresenceList = DocumentTemplate::myScope()->find($courseRequest['presence_list_template_id'] ?? null);
            $versionPresenceList = $templatePresenceList?->versions()?->latest()?->first();

            DB::beginTransaction();
            try {
                $presenceList = PresenceList::create([
                    'uuid' => (string) Str::uuid(),
                    'entity_id' => $userLogged->entity_id,
                    'number_of_hours_studied' => $courseRequest['number_of_hours_studied'],
                    'course_period' => json_encode($courseRequest['periods']),
                    'course_id' => $courseRequest['course_id'],
                    'presence_list_template_version_id' => $versionPresenceList?->id ?? null,
                    'city_id' => $validated['city_id'] ?? null
                ]);

                $creditService->consumeCredits($userLogged, count($employeesToProcess));

                $generator = new GenerateDocumentsService($userLogged, $presenceList);
                $generator->execute($validated);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

            return response()->json([
                'partial' => true,
                'processed_count' => count($employeesToProcess),
                'remaining_count' => count($remainingEmployees),
                'recovery' => $recoveryData,
                'id' => $presenceList->id
            ]);
        }

        $templatePresenceList = DocumentTemplate::myScope()->find($courseRequest['presence_list_template_id'] ?? null);
        $versionPresenceList = $templatePresenceList?->versions()?->latest()?->first();

        DB::beginTransaction();
        try {
            $presenceList = PresenceList::create([
                'uuid' => (string) Str::uuid(),
                'entity_id' => $userLogged->entity_id,
                'number_of_hours_studied' => $courseRequest['number_of_hours_studied'],
                'course_period' => json_encode($courseRequest['periods']),
                'course_id' => $courseRequest['course_id'],
                'presence_list_template_version_id' => $versionPresenceList?->id ?? null,
                'city_id' => $validated['city_id'] ?? null
            ]);

            $creditService->consumeCredits($userLogged, $totalEmployees);

            $generator = new GenerateDocumentsService($userLogged, $presenceList);
            $generator->execute($validated);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $emailsToNotify = config('app.emails_to_notify', []);

        if (app()->environment('production') && ! empty($emailsToNotify)) {
            Mail::to($emailsToNotify)
                ->queue(new SendMailNewGenerateDocuments($userLogged));
        }

        return response()->json([
            'success' => true,
            'id' => $presenceList->id
        ]);
    }

    public function index(IndexDocumentRequest $request)
    {
        $filters = $request->validated();
        
        // Iniciamos a query com os relacionamentos e a trava de segurança por entidade
        $query = Document::query();
        if (!empty($filters['only_deleted']) && Auth::user()->isMaster()) {
            $query->onlyTrashed();
        }
        $query->where('entity_id', Auth::user()->entity_id);

        // 1. Filtro por ID
        if (!empty($filters['id'])) {
            $query->where('id', $filters['id']);
        }

        // Filtro por Presence List ID (Emissão)
        if (!empty($filters['presence_list_id'])) {
            $query->where('presence_list_id', $filters['presence_list_id']);
        }

        // Filtro por Presence List UUID (Emissão)
        if (!empty($filters['presence_list_uuid'])) {
            $query->whereHas('presence_list', function ($q) use ($filters) {
                $q->where('uuid', $filters['presence_list_uuid']);
            });
        }

            if (!empty($filters['event_id'])) {
                $documentIds = EventCheckinLink::where('event_id', $filters['event_id'])
                    ->whereNotNull('generated_document_id')
                    ->pluck('generated_document_id');

                if ($documentIds->isEmpty()) {
                    $query->whereRaw('1 = 0');
                } else {
                    $query->whereIn('id', $documentIds);
                }
            }

        // 2. Filtro por Nome do Funcionário (Relacionamento)
        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', function ($sub) use ($filters) {
                $sub->where('name', 'like', "%{$filters['employee_name']}%");
            });
        }

        // 3. Filtro por CPF (Relacionamento)
        if (!empty($filters['cpf'])) {
            $query->whereHas('employee', function ($sub) use ($filters) {
                $cpfLimpo = preg_replace('/\D/', '', $filters['cpf']); // Opcional: limpa máscara
                $sub->where('cpf', 'like', "%{$cpfLimpo}%");
            });
        }

        // Filtro por Busca Geral (Nome ou CPF)
        if (!empty($filters['search'])) {
            $query->whereHas('employee', function ($sub) use ($filters) {
                $search = $filters['search'];
                $cpfLimpo = preg_replace('/\D/', '', $search);
                $sub->where(function($q) use ($search, $cpfLimpo) {
                    $q->where('name', 'like', "%{$search}%");
                    if (!empty($cpfLimpo)) {
                        $q->orWhere('cpf', 'like', "%{$cpfLimpo}%");
                    }
                });
            });
        }

        // 4. Filtro por IDs de Cursos (Assume-se que é um array)
        if (!empty($filters['course_id']) && is_array($filters['course_id'])) {
            $query->whereIn('course_id', $filters['course_id']);
        }

        // 5. Filtro por Data de Emissão (Início)
        if (!empty($filters['issue_date_start'])) {
            $query->whereDate('issue_date', '>=', $filters['issue_date_start']);
        }

        // 6. Filtro por Data de Emissão (Fim)
        if (!empty($filters['issue_date_end'])) {
            $query->whereDate('issue_date', '<=', $filters['issue_date_end']);
        }

        // 7. Filtro por Validade
        if (!empty($filters['validade'])) {
            if ($filters['validade'] === 'valid') {
                $query->whereDate('date_end_validate', '>=', now());
            } elseif ($filters['validade'] === 'expired') {
                $query->whereDate('date_end_validate', '<', now());
            }
        }

        // Finalmente, executa a paginação ou o get
        $documents = $query->orderBy('created_at', 'desc')->paginate();

        $documents->getCollection()->transform(fn($user) => new DocumentResource($user));

        return response()->json($documents);
    }

    public function destroy($id)
    {
        $document = Document::myScope()->find($id);
        if (!$document) {
            return response()->json(['message' => 'Certificado não encontrado.'], 404);
        }

        // Check 24-hour window
        if ($document->created_at->diffInHours(now()) >= 24) {
            return response()->json([
                'message' => 'O certificado não pode ser excluído pois ultrapassou a janela de 24 horas desde sua emissão.'
            ], 422);
        }

        DB::transaction(function () use ($document) {
            $userLogged = Auth::user();
            
            // Refund credit if entity is using batches
            $creditService = new \App\Services\Credit\CreditManagerService();
            $creditService->refundCredits($userLogged, 1);

            $document->delete();
        });

        return response()->noContent();
    }

    public function show($id)
    {
        return Document::with([
            'employee.company', 
            'position', 
            'course', 
            'registered_by', 
            'presence_list.documents.employee',
            'presence_list.instructors'
        ])
        ->find($id)
        ?->setAppends(['certificate_template_mounted', 'presence_list_template_mounted', 'authorization_template_mounted', 'email_sent']);
    }

    public function html(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'document' => 'required|in:presence_list,certificate,authorization',
        ]);
 
        if ($validator->fails()) {
                return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
    
        return Document::myScope()
        ->find($id)
        ?->setAppends(["{$request->document}_template_mounted"]);
    }

    public function download(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'document' => 'required|in:presence_list,certificate,authorization',
        ]);
 
        if ($validator->fails()) {
                return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $client = new Client();
        $rendererUrl = 'http://renderer:3000/render-pdf'; // URL do novo microserviço
        $document = Document::myScope()->findOrFail($id);
        $mountedField = $request->document . '_template_mounted';
        $mountedHtml = $document->{$mountedField};

        if (!$mountedHtml || !strlen($mountedHtml)) {
            return response()->json(['error' => 'Documento sem template montado para download'], 422);
        }

        $requestBody = [
            'json' => [
                'html' => $mountedHtml
            ]
        ];
    
        $response = $client->post($rendererUrl, $requestBody);

        $responseData = json_decode($response->getBody()->getContents(), true);
        
        if (isset($responseData['base64'])) {
            $pdfData = base64_decode($responseData['base64']);
            
            $filename = "document.pdf"; // Ex: certificate_123.pdf

            return Response::make($pdfData, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => strlen($pdfData),
            ]);
            
        } else {
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }
    }

    public function documentValidate($uuid)
    {
        return Document::with(['course', 'employee.company', 'entity'])
        ->where('uuid', $uuid)
        ->first()
        ?->setAppends(['certificate_template_mounted']);
    }

    public function sendEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'document_id' => 'required|exists:documents,id',
            'send_authorization' => 'required|boolean',
            'send_certificate' => 'required|boolean',
            'send_presence_list' => 'required|boolean',
        ]);

        $document = Document::myScope()
            ->with(['employee.company', 'entity.config'])
            ->findOrFail($data['document_id']);

        $user = Auth::user();
        if ($user && !$user->isMaster()) {
            $creditService = new \App\Services\Credit\CreditManagerService();
            $availableCredits = $creditService->getAvailableBalance($user);

            if (($document->email_sent_count ?? 0) >= 2) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['Este certificado já foi enviado por e-mail 2 vezes. Não é permitido enviar mais.']
                ]);
            }

            if ($availableCredits === 0 && $document->email_sent) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['Você está sem créditos e este certificado já foi enviado por e-mail. Adquira mais créditos para reenviar.']
                ]);
            }
        }

        $sendNotificationMailService = new SendNotificationMailService();
        $sendNotificationMailService->execute($data, $document);

        return response()->json([
            'message' => 'Sua solicitação foi encaminhada, por favor aguarde.'
        ]);
    }

    public function sendEmailBatch(Request $request)
    {
        $data = $request->validate([
            'presence_list_id' => 'nullable|exists:presence_lists,id',
            'presence_list_uuid' => 'nullable|exists:presence_lists,uuid',
        ]);

        $query = PresenceList::myScope()
        ->with([
            'documents' => function ($query) {
                $query->whereHas('employee', function ($q) {
                    $q->whereNotNull('email')->where('email', '!=', '');
                })->with(['employee.company', 'entity.config']);
            }
        ]);

        if (!empty($data['presence_list_uuid'])) {
            $presenceList = $query->where('uuid', $data['presence_list_uuid'])->firstOrFail();
        } else {
            $presenceList = $query->findOrFail($data['presence_list_id']);
        }
  
        SendEmailBatchJob::dispatch($presenceList, Auth::user());

        return response()->json([
            'message' => 'Sua solicitação foi encaminhada, por favor aguarde.'
        ]);
    }

    public function checkEmailSent($id)
    {
        $document = Document::myScope()->find($id);
        if (!$document) {
            return response()->json(['email_sent' => false, 'email_sent_count' => 0]);
        }
        
        return response()->json([
            'email_sent' => (bool)$document->email_sent,
            'email_sent_count' => (int)($document->email_sent_count ?? 0)
        ]);
    }
}

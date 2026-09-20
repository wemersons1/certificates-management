<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateVersion;
use App\Models\Employee;
use App\Models\Entity;
use App\Models\User;
use App\Models\CreditBatch;
use App\Models\PresenceList;
use App\Services\Credit\CreditManagerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreditControlSystemTest extends TestCase
{
    use RefreshDatabase;

    private $entity;
    private $user;
    private $creditService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            \Database\Seeders\RoleSeeder::class,
            \Database\Seeders\EntityStatusSeeder::class,
            \Database\Seeders\DocumentTemplateTypeSeeder::class,
        ]);

        $this->entity = Entity::factory()->create([
            'status_id' => \App\Enums\EntityStatusEnum::COMPLIENT->value,
        ]);

        $this->user = User::factory()->create([
            'entity_id' => $this->entity->id,
            'role_id' => \App\Enums\RoleEnum::ENTITY->value,
        ]);

        $this->creditService = new CreditManagerService();
    }

    public function test_credit_manager_calculates_balance_and_consumes_fifo(): void
    {
        // 1. Welcome Batch (indefinite expiration)
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 10,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => null
        ]);

        // 2. Monthly Batch (expires tomorrow)
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'monthly',
            'total_credits' => 5,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => now()->addDay()
        ]);

        // 3. Add-on Batch (expires in 30 days)
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'addon',
            'total_credits' => 15,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => now()->addDays(30)
        ]);

        // Check available balance
        $balance = $this->creditService->getAvailableBalance($this->user);
        $this->assertEquals(30, $balance);

        $detailed = $this->creditService->getDetailedBalance($this->user);
        $this->assertEquals(10, $detailed['free']);
        $this->assertEquals(5, $detailed['monthly_yearly']);
        $this->assertEquals(15, $detailed['addon']);

        // Consume 8 credits. FIFO should consume:
        // - 5 from Monthly batch (expires tomorrow)
        // - 3 from Add-on batch (expires in 30 days)
        // - 0 from Welcome batch (free, no expiration)
        $this->creditService->consumeCredits($this->user, 8);

        $monthlyBatch = CreditBatch::where('user_id', $this->user->id)->where('type', 'monthly')->first();
        $addonBatch = CreditBatch::where('user_id', $this->user->id)->where('type', 'addon')->first();
        $freeBatch = CreditBatch::where('user_id', $this->user->id)->where('type', 'free')->first();

        $this->assertEquals(5, $monthlyBatch->used_credits);
        $this->assertEquals(3, $addonBatch->used_credits);
        $this->assertEquals(0, $freeBatch->used_credits);

        $this->assertEquals(22, $this->creditService->getAvailableBalance($this->user));
    }

    public function test_document_generation_slices_and_returns_recovery_json(): void
    {
        Sanctum::actingAs($this->user);

        // Set up template, course, employees
        $template = DocumentTemplate::create([
            'name' => 'Template Test',
            'type_id' => 1,
            'entity_id' => $this->entity->id
        ]);
        $version = DocumentTemplateVersion::create([
            'document_template_id' => $template->id,
            'template' => '<h1>Cert</h1>',
            'frame_type' => 'color',
            'type_id' => 1,
            'orientation' => 'landscape'
        ]);

        $course = Course::create([
            'name' => 'Course A',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id,
            'certificate_id' => $template->id
        ]);

        $employees = [];
        for ($i = 0; $i < 5; $i++) {
            $employees[] = Employee::create([
                'name' => "Student $i",
                'entity_id' => $this->entity->id
            ]);
        }

        // Add 2 credits to user
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 2,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => null
        ]);

        $payload = [
            'city_name' => 'São Paulo',
            'company_name' => 'Company A',
            'company_representative' => 'Rep A',
            'city_id' => null,
            'company_id' => null,
            'position' => 'Dev',
            'courses' => [
                [
                    'course_id' => $course->id,
                    'number_of_hours_studied' => 10,
                    'periods' => [
                        ['start_date' => '2026-06-01', 'end_date' => '2026-06-02']
                    ],
                    'instructors' => [],
                    'employees' => collect($employees)->map(fn($e) => ['id' => $e->id])->toArray(),
                    'issue_date' => '2026-06-02',
                    'presence_list_template_id' => $template->id
                ]
            ]
        ];

        $response = $this->postJson('/api/documents', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'partial',
            'processed_count',
            'remaining_count',
            'recovery' => [
                'course_id',
                'original_config',
                'remaining_employees'
            ]
        ]);

        $this->assertTrue($response->json('partial'));
        $this->assertEquals(2, $response->json('processed_count'));
        $this->assertEquals(3, $response->json('remaining_count'));
    }

    public function test_document_generation_blocks_if_zero_credits(): void
    {
        Sanctum::actingAs($this->user);

        $template = DocumentTemplate::create([
            'name' => 'Template Test',
            'type_id' => 1,
            'entity_id' => $this->entity->id
        ]);
        $course = Course::create([
            'name' => 'Course A',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id,
            'certificate_id' => $template->id
        ]);
        $employee = Employee::create([
            'name' => "Student",
            'entity_id' => $this->entity->id
        ]);

        // Zero credits batch
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 0,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => null
        ]);

        $payload = [
            'city_name' => 'São Paulo',
            'company_name' => 'Company A',
            'company_representative' => 'Rep A',
            'courses' => [
                [
                    'course_id' => $course->id,
                    'number_of_hours_studied' => 10,
                    'periods' => [
                        ['start_date' => '2026-06-01', 'end_date' => '2026-06-02']
                    ],
                    'instructors' => [],
                    'employees' => [['id' => $employee->id]],
                    'issue_date' => '2026-06-02',
                    'presence_list_template_id' => $template->id
                ]
            ]
        ];

        $response = $this->postJson('/api/documents', $payload);
        $response->assertStatus(422);
    }

    public function test_resume_emission_processes_remaining_employees(): void
    {
        Sanctum::actingAs($this->user);

        $template = DocumentTemplate::create([
            'name' => 'Template Test',
            'type_id' => 1,
            'entity_id' => $this->entity->id
        ]);
        $version = DocumentTemplateVersion::create([
            'document_template_id' => $template->id,
            'template' => '<h1>Cert</h1>',
            'frame_type' => 'color',
            'type_id' => 1,
            'orientation' => 'landscape'
        ]);
        $course = Course::create([
            'name' => 'Course A',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id,
            'certificate_id' => $template->id
        ]);
        $employee = Employee::create([
            'name' => "Student A",
            'entity_id' => $this->entity->id
        ]);

        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 5,
            'used_credits' => 0,
            'start_date' => now(),
            'expires_at' => null
        ]);

        $recoveryData = [
            'course_id' => $course->id,
            'original_config' => [
                'city_name' => 'São Paulo',
                'company_name' => 'Company A',
                'company_representative' => 'Rep A',
                'number_of_hours_studied' => 10,
                'periods' => [
                    ['start_date' => '2026-06-01', 'end_date' => '2026-06-02']
                ],
                'instructors' => [],
                'issue_date' => '2026-06-02',
                'presence_list_template_id' => $template->id
            ],
            'remaining_employees' => [
                ['id' => $employee->id]
            ]
        ];

        $response = $this->postJson('/api/credits/resume', [
            'recovery_data' => $recoveryData
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true
        ]);
    }

    public function test_delete_certificate_within_24_hours_refunds_credit(): void
    {
        Sanctum::actingAs($this->user);

        // 1. Setup credits
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 5,
            'used_credits' => 2, // 2 credits consumed
            'start_date' => now(),
            'expires_at' => null
        ]);

        $employee = Employee::create([
            'name' => "Student A",
            'entity_id' => $this->entity->id
        ]);

        $course = Course::create([
            'name' => 'Course A',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id
        ]);

        $template = DocumentTemplate::create([
            'name' => 'Template Test A',
            'type_id' => 1,
            'entity_id' => $this->entity->id
        ]);
        $version = DocumentTemplateVersion::create([
            'document_template_id' => $template->id,
            'template' => '<h1>Cert</h1>',
            'frame_type' => 'color',
            'type_id' => 1,
            'orientation' => 'landscape'
        ]);

        // 2. Create document (created now)
        $document = \App\Models\Document::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'employee_id' => $employee->id,
            'course_id' => $course->id,
            'entity_id' => $this->entity->id,
            'registered_by_id' => $this->user->id,
            'number_of_hours_studied' => 10,
            'issue_date' => now(),
            'certificate_template_version_id' => $version->id
        ]);

        $this->assertEquals(3, $this->creditService->getAvailableBalance($this->user));

        // 3. Delete document (within 24 hours)
        $response = $this->deleteJson("/api/documents/{$document->id}");
        $response->assertStatus(204);

        // 4. Verify soft deleted and credit refunded
        $this->assertSoftDeleted('documents', ['id' => $document->id]);
        $this->assertEquals(4, $this->creditService->getAvailableBalance($this->user));
    }

    public function test_delete_certificate_after_24_hours_is_blocked(): void
    {
        Sanctum::actingAs($this->user);

        // 1. Setup credits
        CreditBatch::create([
            'user_id' => $this->user->id,
            'type' => 'free',
            'total_credits' => 5,
            'used_credits' => 2,
            'start_date' => now(),
            'expires_at' => null
        ]);

        $employee = Employee::create([
            'name' => "Student B",
            'entity_id' => $this->entity->id
        ]);

        $course = Course::create([
            'name' => 'Course B',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id
        ]);

        $template = DocumentTemplate::create([
            'name' => 'Template Test B',
            'type_id' => 1,
            'entity_id' => $this->entity->id
        ]);
        $version = DocumentTemplateVersion::create([
            'document_template_id' => $template->id,
            'template' => '<h1>Cert</h1>',
            'frame_type' => 'color',
            'type_id' => 1,
            'orientation' => 'landscape'
        ]);

        // 2. Create document and set created_at to 25 hours ago
        $document = \App\Models\Document::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'employee_id' => $employee->id,
            'course_id' => $course->id,
            'entity_id' => $this->entity->id,
            'registered_by_id' => $this->user->id,
            'number_of_hours_studied' => 10,
            'issue_date' => now(),
            'certificate_template_version_id' => $version->id
        ]);

        $document->created_at = now()->subHours(25);
        $document->save();

        $this->assertEquals(3, $this->creditService->getAvailableBalance($this->user));

        // 3. Delete document (after 24 hours) - should fail
        $response = $this->deleteJson("/api/documents/{$document->id}");
        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'O certificado não pode ser excluído pois ultrapassou a janela de 24 horas desde sua emissão.'
        ]);

        // 4. Verify document is not deleted and credit not refunded
        $this->assertDatabaseHas('documents', ['id' => $document->id, 'deleted_at' => null]);
        $this->assertEquals(3, $this->creditService->getAvailableBalance($this->user));
    }
}

<?php

namespace Tests\Feature;

use App\Helpers\BuildTemplate;
use App\Helpers\ApplyMaskDocument;
use App\Models\Course;
use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateVersion;
use App\Models\Entity;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateGenerationPipelineTest extends TestCase
{
    use RefreshDatabase;

    private $entity;
    private $employee;
    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed references
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

        $this->employee = Employee::create([
            'name' => 'John Doe Student',
            'entity_id' => $this->entity->id,
        ]);
    }

    public function test_course_default_new_version_is_false()
    {
        $course = Course::create([
            'name' => 'Legacy Course Test',
            'number_of_hours_studied' => 10,
            'entity_id' => $this->entity->id,
        ]);

        $course->refresh();
        $this->assertFalse($course->new_version);
    }

    public function test_can_set_new_version_to_true()
    {
        $course = Course::create([
            'name' => 'V4 Course Test',
            'number_of_hours_studied' => 40,
            'new_version' => true,
            'entity_id' => $this->entity->id,
        ]);

        $course->refresh();
        $this->assertTrue($course->new_version);
    }

    public function test_build_template_legacy_vs_new_version()
    {
        // 1. Create a template frame and template
        $template = DocumentTemplate::create([
            'name' => 'Test Template',
            'orientation' => 'landscape',
            'entity_id' => $this->entity->id,
        ]);

        $templateVersion = DocumentTemplateVersion::create([
            'document_template_id' => $template->id,
            'template' => '<div class="cert-container"><div class="content-side">Legacy Certificate {{nome_aluno}} </div></div>',
            'back_document' => '<div class="cert-container"><div class="content-side">Back Legacy {{nome_aluno}} </div></div>',
            'orientation' => 'landscape',
            'type_id' => \App\Models\DocumentTemplateType::first()->id,
        ]);

        // 2. Create courses (Legacy vs New)
        $legacyCourse = Course::create([
            'name' => 'Legacy Course',
            'number_of_hours_studied' => 20,
            'new_version' => false,
            'certificate_id' => $template->id,
            'entity_id' => $this->entity->id,
        ]);

        $v4Course = Course::create([
            'name' => 'V4 Course',
            'number_of_hours_studied' => 30,
            'new_version' => true,
            'certificate_id' => $template->id,
            'entity_id' => $this->entity->id,
        ]);

        // 3. Create Documents
        $legacyDoc = Document::create([
            'uuid' => 'test-legacy-uuid',
            'presence_list_id' => null,
            'employee_id' => $this->employee->id,
            'course_id' => $legacyCourse->id,
            'certificate_template_version_id' => $templateVersion->id,
            'entity_id' => $this->entity->id,
            'issue_date' => now()->toDateString(),
            'registered_by_id' => $this->user->id,
        ]);

        $v4Doc = Document::create([
            'uuid' => 'test-v4-uuid',
            'presence_list_id' => null,
            'employee_id' => $this->employee->id,
            'course_id' => $v4Course->id,
            'certificate_template_version_id' => $templateVersion->id,
            'entity_id' => $this->entity->id,
            'issue_date' => now()->toDateString(),
            'registered_by_id' => $this->user->id,
        ]);

        // 4. Build Legacy Template HTML
        $legacyHtml = BuildTemplate::build($legacyDoc, $templateVersion);
        $this->assertStringContainsString('Legacy Certificate', $legacyHtml);
        $this->assertStringNotContainsString('v4-page', $legacyHtml);
        $this->assertStringContainsString('data:image/png;base64,', $legacyHtml);

        // 5. Build V4 Template HTML
        $v4Html = BuildTemplate::build($v4Doc, $templateVersion);
        $this->assertStringContainsString('v4-page', $v4Html);
        $this->assertStringContainsString('data:image/png;base64,', $v4Html);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Entity;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateFrame;
use App\Services\Template\CourseTemplateUploadService;
use App\Jobs\ApplyInCourseMaskWithGeminiJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseTemplateUploadServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_service_extracts_metadata_via_gemini_and_does_not_dispatch_mask_job(): void
    {
        Queue::fake();

        // Seed necessary reference tables
        $this->seed([
            \Database\Seeders\RoleSeeder::class,
            \Database\Seeders\EntityStatusSeeder::class,
            \Database\Seeders\DocumentTemplateTypeSeeder::class,
        ]);

        // Create Entity with active status and User
        $entity = Entity::factory()->create([
            'status_id' => \App\Enums\EntityStatusEnum::COMPLIENT->value,
        ]);

        $user = User::factory()->create([
            'entity_id' => $entity->id,
            'role_id' => \App\Enums\RoleEnum::ENTITY->value,
        ]);

        Sanctum::actingAs($user);

        // Create a base custom frame
        DocumentTemplateFrame::create([
            'entity_id' => $entity->id,
            'frame' => 'some-frame-path.png',
            'is_top_only' => false,
        ]);

        // Mock the Artisan command 'certificate:generate-html'
        Artisan::shouldReceive('call')
            ->once()
            ->with('certificate:generate-html', \Mockery::any())
            ->andReturnUsing(function ($command, $parameters) {
                $outputPath = $parameters['--output'] ?? $parameters['output'] ?? null;
                $metaOutputPath = $parameters['--meta-output'] ?? null;

                if ($outputPath) {
                    file_put_contents($outputPath, '<html><body><div id="page1-div" style="width:794px;height:1123px;"><p>Texto {{nome_aluno}}</p></div></body></html>');
                }
                if ($metaOutputPath) {
                    file_put_contents($metaOutputPath, json_encode([
                        'mask_values' => [
                            '{{nome_curso}}' => 'Curso Fallback',
                            '{{carga_horaria}}' => '10h',
                        ],
                        'orientation' => 'portrait',
                    ]));
                }
                return 0;
            });

        // Mock GeminiService to return specific course and instructor metadata
        $mockGemini = $this->mock(\App\Services\Gemini\GeminiService::class);
        $mockGemini->shouldReceive('interpret')
            ->once()
            ->andReturn(json_encode([
                'nome_curso' => 'Curso Extraido por Gemini',
                'carga_horaria' => '24',
                'nome_instrutor' => 'Instrutor da Silva',
                'formacao_instrutor' => 'Mestre em Seguranca',
                'crea_instrutor' => 'CREA-12345',
            ]));

        // Run the upload service with a fake file
        $file = UploadedFile::fake()->create('certificate.pdf', 20, 'application/pdf');
        $service = new CourseTemplateUploadService();
        $result = $service->handle($file);

        // Assert the job was NOT queued
        Queue::assertNotPushed(ApplyInCourseMaskWithGeminiJob::class);

        // Assert course was created with the Gemini-extracted values
        $this->assertDatabaseHas('courses', [
            'name' => 'Curso Extraido por Gemini',
            'number_of_hours_studied' => '24',
            'entity_id' => $entity->id,
        ]);

        // Assert instructor was created with the Gemini-extracted values
        $this->assertDatabaseHas('instructors', [
            'name' => 'Instrutor da Silva',
            'formation' => 'Mestre em Seguranca',
            'crea' => 'CREA-12345',
            'entity_id' => $entity->id,
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use Tests\TestCase;

class CourseImportTemplateApiTest extends TestCase
{
    public function test_requires_authentication(): void
    {
        $file = UploadedFile::fake()->create('certificate.pdf', 20, 'application/pdf');

        $response = $this->post('/api/courses/import-template', [
            'template_file' => $file,
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertUnauthorized();
    }

    public function test_imports_template_and_returns_created_response(): void
    {
        Sanctum::actingAs(User::factory()->make());

        $this->withoutMiddleware(\App\Http\Middleware\LogAuditTrail::class);

        $expected = [
            'message' => 'Template importado e curso cadastrado com sucesso.',
            'course' => ['id' => 123, 'name' => 'Curso Teste'],
            'document_template' => ['id' => 456],
            'used_masks' => ['{{nome}}'],
            'extracted' => [
                'course' => [
                    'name' => 'Curso Teste',
                    'number_of_hours_studied' => '8',
                    'orientation' => 'landscape',
                ],
                'mask_values' => ['{{carga_horaria}}' => '8h'],
            ],
        ];

        $this->mock('App\\Services\\Template\\CourseTemplateUploadService', function (MockInterface $mock) use ($expected): void {
            $mock->shouldReceive('handle')->once()->andReturn($expected);
        });

        $file = UploadedFile::fake()->create('certificate.pdf', 20, 'application/pdf');

        $response = $this->post('/api/courses/import-template', [
            'template_file' => $file,
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertCreated();
        $response->assertJson($expected);
    }
}

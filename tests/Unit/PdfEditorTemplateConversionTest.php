<?php

namespace Tests\Unit;

use App\Services\Template\CourseTemplateUploadService;
use PHPUnit\Framework\TestCase;

class PdfEditorTemplateConversionTest extends TestCase
{
    public function test_converts_pdf_page_into_editor_container_with_centered_positioned_blocks(): void
    {
        $pageHtml = <<<'HTML'
<div id="page1-div" style="position:relative;width:1264px;height:893px;">
    <p style="position:absolute;top:377px;left:175px;white-space:nowrap;font-size:62px;"><b>Jessica Estela</b></p>
    <img width="100" height="100" src="data:image/png;base64,qrcode" style="position:absolute;top:700px;left:80px;" alt="QR Code"/>
</div>
HTML;

        $service = new CourseTemplateUploadService();
        $method = new \ReflectionMethod($service, 'convertPdfPageToEditorTemplate');
        $method->setAccessible(true);
        $result = (string) $method->invoke($service, $pageHtml, 'landscape');

        $this->assertStringContainsString('class="cert-container"', $result);
        $this->assertStringContainsString('width:1123px;height:794px', $result);
        $this->assertStringContainsString('class="content-side"', $result);
        $this->assertStringContainsString('top:335.2px;left:0;width:100%;text-align:center', $result);
        $this->assertStringContainsString('data:image/png;base64,qrcode', $result);
        $this->assertStringContainsString('top:622.4px;left:71.08px', $result);
    }
}

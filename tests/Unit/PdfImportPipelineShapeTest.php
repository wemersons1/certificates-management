<?php

namespace Tests\Unit;

use App\Services\Template\CourseTemplateUploadService;
use PHPUnit\Framework\TestCase;

class PdfImportPipelineShapeTest extends TestCase
{
    public function test_full_pdf_shape_pipeline_keeps_text_after_frame_extraction_and_page_split(): void
    {
        $html = <<<'HTML'
<html><body><div id="page1-div" style="position:relative;width:1264px;height:893px;">
    <img width="1264" height="893" src="data:image/png;base64,background" alt="background image"/>
    <img width="100" height="100" src="data:image/png;base64,qrcode" style="position:absolute;top:700px;left:80px;" alt="QR Code"/>
    <p style="position:absolute;top:377px;left:175px;white-space:nowrap;font-size:62px;"><b>Jessica Estela</b></p>
</div></body></html>
HTML;

        $service = new CourseTemplateUploadService();
        $extract = new \ReflectionMethod($service, 'extractPdfFramesAndRemoveFromTemplate');
        $extract->setAccessible(true);
        [$withoutFrame, $frames] = $extract->invoke($service, $html);

        $split = new \ReflectionMethod($service, 'splitFrontAndBack');
        $split->setAccessible(true);
        [$front] = $split->invoke($service, $withoutFrame);

        $convert = new \ReflectionMethod($service, 'convertPdfPageToEditorTemplate');
        $convert->setAccessible(true);
        $result = (string) $convert->invoke($service, $front, 'landscape');

        $this->assertCount(1, $frames);
        $this->assertStringContainsString('class="cert-container"', $result);
        $this->assertStringContainsString('Jessica Estela', $result);
        $this->assertStringContainsString('text-align:center', $result);
        $this->assertStringContainsString('data:image/png;base64,qrcode', $result);
    }
}

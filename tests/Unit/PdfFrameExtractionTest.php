<?php

namespace Tests\Unit;

use App\Services\Template\CourseTemplateUploadService;
use PHPUnit\Framework\TestCase;

class PdfFrameExtractionTest extends TestCase
{
    public function test_extracts_only_page_sized_background_and_keeps_text_and_small_images(): void
    {
        $html = <<<'HTML'
<div id="page1-div" style="position:relative;width:1264px;height:893px;">
    <img width="1264" height="893" src="data:image/png;base64,background" alt="background image"/>
    <img width="100" height="100" src="data:image/png;base64,qrcode" alt="QR Code"/>
    <p style="position:absolute;top:377px;left:175px;font-size:62px;">Jessica Estela</p>
</div>
HTML;

        $service = new CourseTemplateUploadService();
        $method = new \ReflectionMethod($service, 'extractPdfFramesAndRemoveFromTemplate');
        $method->setAccessible(true);
        [$updatedHtml, $frames] = $method->invoke($service, $html);

        $this->assertCount(1, $frames);
        $this->assertSame('data:image/png;base64,background', $frames[0]);
        $this->assertStringNotContainsString('background image', $updatedHtml);
        $this->assertStringContainsString('data:image/png;base64,qrcode', $updatedHtml);
        $this->assertStringContainsString('Jessica Estela', $updatedHtml);
    }
}

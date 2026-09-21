<?php

namespace Tests\Unit;

use App\Console\Commands\GenerateCertificateHtml;
use PHPUnit\Framework\TestCase;

class PdfTextBlockNormalizationTest extends TestCase
{
    public function test_pdf_paragraphs_keep_original_coordinates_and_same_line_blocks(): void
    {
        $html = <<<'HTML'
<div id="page1-div" style="position:relative;width:1264px;height:893px;">
    <p style="position:absolute;top:100px;left:150px;font-size:62px;"><b>Jessica Estela</b></p>
    <p style="position:absolute;top:200px;left:450px;font-size:21px;"><b>Ministrante:</b></p>
    <p style="position:absolute;top:200px;left:575px;font-size:21px;">Prof. Alberto</p>
</div>
HTML;

        $command = new GenerateCertificateHtml();
        $method = new \ReflectionMethod($command, 'normalizePdfLikeHtml');
        $method->setAccessible(true);
        $result = (string) $method->invoke($command, $html, 'certificate');

        $this->assertStringNotContainsString('left:0;width:1264px;text-align:center;', $result);
        $this->assertStringContainsString('top:100px;left:150px;', $result);
        $this->assertStringContainsString('top:200px;left:450px;', $result);
        $this->assertStringContainsString('top:200px;left:575px;', $result);
        $this->assertStringContainsString('<b>Ministrante:</b>', $result);
        $this->assertStringContainsString('Prof. Alberto', $result);
        $this->assertSame(3, substr_count($result, '<p'));
    }
}

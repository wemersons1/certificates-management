<?php

namespace App\Helpers;

class AppHelper {
    public static function formatCentsToFloat(float $numberInCents): float {
        return (float) number_format($numberInCents/100, 2, '.', '');
    }
 
    public static function removeEmptyTags($html)
    {
        // Tags a serem limpas.
        $tags = [];
        
        // Expressão regular para encontrar tags de abertura e fechamento
        // que contenham apenas espaços, &nbsp; ou <br> e que podem ter
        // atributos (como 'style' ou 'class').
        $patternWithAttributes = '/<(' . implode('|', $tags) . ')\b[^>]*>(\s|&nbsp;|<br\/?>)*<\/\1>/i';

        // Substitui as tags que contenham apenas conteúdo "vazio" por <br/>.
        $sanitized_html = preg_replace($patternWithAttributes, '<br/>', $html);
        
        // A segunda expressão regular para parágrafos vazios do TinyMCE
        // também precisa ser ajustada para incluir atributos.
        $sanitized_html = preg_replace('/<p[^>]*>(\s|&nbsp;)*<\/p>/i', '<br/>', $sanitized_html);
        
        // Remove espaços em branco no início e no fim do conteúdo.
        $sanitized_html = trim($sanitized_html);
        
        // Retorna o conteúdo sanitizado.
        return !empty($sanitized_html) ? $sanitized_html : '';
    }

    public static function removeEmptyTagsToCourses(string $html): string
    {
        // Tags de parágrafo e título que devem ser limpas se estiverem vazias.
        $tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        
        $pattern = '/<(' . implode('|', $tags) . ')\b[^>]*>(\s|&nbsp;|<br\/?>)*<\/\1>/i';
        
        // 1. Remove as tags de parágrafo e título vazias.
        $sanitized_html = preg_replace($pattern, '', $html);

        // 3. Remove espaços em branco (incluindo quebras de linha no código) no início e no fim do conteúdo.
        $sanitized_html = trim($sanitized_html);

        // Retorna o conteúdo sanitizado. Se estiver vazio, retorna uma string vazia.
        return !empty($sanitized_html) ? $sanitized_html : '';
    }
}

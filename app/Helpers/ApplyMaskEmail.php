<?php

namespace App\Helpers;

class ApplyMaskEmail {
    public static function apply($data, $text = ''): string
    {
        if (!$text) {
            return '';
        }
        
        foreach ($data as $key => $value) {
            $text = str_replace("{{" . $key . "}}", $value, $text);
        }

        return $text;
    }
}

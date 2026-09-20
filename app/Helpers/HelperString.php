<?php

namespace App\Helpers;

class HelperString {
    public static function onlyNumbers($value): string | null
    {
        if ($value)
            return preg_replace('/\D/', '', $value) ?? null;

        return null;
    }

    public static function getFirstAndLastName(string $fullName): array
    {
        // Remove espaços em branco extras no início e fim
        $fullName = trim($fullName);

        // Divide a string em um array usando o espaço como delimitador
        $nameParts = explode(' ', $fullName);

        // Pega o primeiro elemento do array (primeiro nome)
        $firstName = $nameParts[0];

        // Remove o primeiro nome do array
        array_shift($nameParts);

        // Junta o restante do array para formar o sobrenome (último nome)
        // Se não houver mais partes, o sobrenome será uma string vazia
        $lastName = implode(' ', $nameParts);

        return [
            'first_name' => $firstName,
            'last_name' => $lastName
        ];
    }

    public static function extractPhoneDetails(string $fullPhoneNumber): array
    {
        // Remove qualquer caractere não numérico
        $cleanedNumber = preg_replace('/[^0-9]/', '', $fullPhoneNumber);

        // Se o número tiver menos de 2 dígitos, não é possível extrair o DDD
        if (strlen($cleanedNumber) < 2) {
            return [
                'area_code' => '',
                'number' => $cleanedNumber
            ];
        }

        // O código de área (DDD) são os 2 primeiros dígitos
        $areaCode = substr($cleanedNumber, 0, 2);

        // O número de telefone é o restante da string
        $number = substr($cleanedNumber, 2);

        return [
            'area_code' => $areaCode,
            'number' => $number
        ];
    }

    public static function initialLettersUppercase(string $string): string
    {
        // 1. Deixar toda a string em minúsculas
        $string = mb_strtolower($string, 'UTF-8');

        // 2. Dividir a string em palavras
        $words = explode(' ', $string);

        // 3. Aplicar a regra de capitalização em cada palavra
        $capitalizedWords = array_map(function ($word) {
            // Ignorar palavras vazias que podem surgir de múltiplos espaços
            if (empty($word)) {
                return $word;
            }

            // Se a palavra tiver 3 ou mais caracteres, capitaliza a primeira letra
            if (mb_strlen($word, 'UTF-8') >= 3) {
                return mb_strtoupper(mb_substr($word, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($word, 1, null, 'UTF-8');
            } else {
                // Se tiver menos de 3 caracteres, mantém em minúsculas (como já está)
                return $word;
            }
        }, $words);

        // 4. Juntar as palavras novamente em uma string
        return implode(' ', $capitalizedWords);
    }

    public static function formatCpf(?string $cpf): string
    {
        $cpf = preg_replace('/\D/', '', (string)$cpf);
        if (strlen($cpf) !== 11) {
            return (string)$cpf;
        }

        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }

    public static function formatRg(?string $rg): string
    {
        $rg = preg_replace('/\D/', '', (string)$rg);
        
        // RG varies a lot, but a common 9-digit format is 00.000.000-0
        if (strlen($rg) === 9) {
            return preg_replace('/(\d{2})(\d{3})(\d{3})(\d{1})/', '$1.$2.$3-$4', $rg);
        }

        // 8-digit format: 0.000.000-0 or 00.000.000
        if (strlen($rg) === 8) {
            return preg_replace('/(\d{1})(\d{3})(\d{3})(\d{1})/', '$1.$2.$3-$4', $rg);
        }

        return (string)$rg;
    }

    public static function ensureUtf8(?string $content): ?string
    {
        if (!$content) {
            return $content;
        }

        // Remove BOM if present
        $bom = pack('H*', 'EFBBBF');
        $content = preg_replace("/^$bom/", '', $content);

        if (mb_check_encoding($content, 'UTF-8')) {
            return $content;
        }

        // Tenta detectar a codificação. Comum no BR: ISO-8859-1 ou Windows-1252
        $encoding = mb_detect_encoding($content, ['ISO-8859-1', 'Windows-1252', 'UTF-7', 'ASCII'], true);
        
        if ($encoding) {
            return mb_convert_encoding($content, 'UTF-8', $encoding);
        }

        // Se falhou detecção, força conversão de ISO-8859-1 (chute seguro no BR)
        return mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1');
    }

    public static function abbreviateName(string $fullName, int $maxLength = 30): string
    {
        $fullName = trim($fullName);
        if (mb_strlen($fullName, 'UTF-8') <= $maxLength) {
            return $fullName;
        }

        $parts = explode(' ', $fullName);
        if (count($parts) <= 2) {
            // Se só tem primeiro e último nome, ou só um nome, retorna truncado se passar do limite
            if (mb_strlen($fullName, 'UTF-8') > $maxLength) {
                return mb_substr($fullName, 0, $maxLength, 'UTF-8');
            }
            return $fullName;
        }

        $first = array_shift($parts);
        $last = array_pop($parts);

        // Abrevia os nomes do meio progressivamente até caber no limite
        for ($i = 0; $i < count($parts); $i++) {
            $part = $parts[$i];
            if (in_array(mb_strtolower($part, 'UTF-8'), ['de', 'da', 'do', 'dos', 'e'], true)) {
                $parts[$i] = ''; // Remove preposições para economizar espaço
            } else {
                $parts[$i] = mb_strtoupper(mb_substr($part, 0, 1, 'UTF-8'), 'UTF-8') . '.';
            }
        }

        // Filtra partes vazias (preposições removidas)
        $parts = array_values(array_filter($parts));

        // Tenta montar o nome com iniciais abreviadas
        $middle = implode(' ', $parts);
        $result = $first . ($middle !== '' ? ' ' . $middle : '') . ' ' . $last;

        // Se ainda assim ultrapassar o limite, começamos a remover iniciais do meio do fim para o começo
        while (mb_strlen($result, 'UTF-8') > $maxLength && count($parts) > 0) {
            array_pop($parts);
            $middle = implode(' ', $parts);
            $result = $first . ($middle !== '' ? ' ' . $middle : '') . ' ' . $last;
        }

        // Se mesmo só com primeiro e último nome ultrapassar o limite, trunca o último nome
        if (mb_strlen($result, 'UTF-8') > $maxLength) {
            $result = mb_substr($result, 0, $maxLength, 'UTF-8');
        }

        return $result;
    }
}

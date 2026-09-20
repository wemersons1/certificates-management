<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper {
    public static function getDateTheTextInFull($date): string
    {     
        if (is_null($date) || $date === '') {
            return '';
        }

        Carbon::setLocale('pt_BR');
        $carbon = Carbon::createFromFormat('Y-m-d', $date);
        $mes = ucfirst($carbon->translatedFormat('F')); // Março
        $dia = $carbon->format('j');                   // 1
        $ano = $carbon->format('Y');                   // 2025

        return "{$dia} de {$mes} de {$ano}";
    }

    public static function getDateInDayMonthYear($date): string
    {
        if (is_null($date) || $date === '') {
            return '';
        }

        return Carbon::createFromFormat('Y-m-d', $date)->format('d/m/Y');
    }

    public static function getCoursePeriod($coursePeriods) 
    {
        if (!is_array($coursePeriods)) {
            return '';
        }
        
        $arrayText = [];

        foreach ($coursePeriods as $key => $item) {
            $from = DateHelper::getDateInDayMonthYear($item->start_date);
            $to = DateHelper::getDateInDayMonthYear($item->end_date);

            if ($from == $to) {
                $arrayText[] = $from;
            } else {
                $of = '';
                if ($key > 0) {
                    $of = 'de';
                }
                $arrayText[] = "{$of} {$from} a {$to}";
            }
        }

        $count = count($arrayText);

        if ($count === 0) {
            return '';
        }

        if ($count === 1) {
            return $arrayText[0];
        }

        if ($count === 2) {
            return $arrayText[0] . ' e ' . $arrayText[1];
        }

        // Mais de dois períodos: separa com vírgula e usa "e" no último
        $last = array_pop($arrayText);
        return implode(', ', $arrayText) . ' e ' . $last;
    }
}

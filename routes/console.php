<?php

use App\Services\Document\DocumentNotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:send-mail-notification', function () {
    app(DocumentNotificationService::class)
        ->execute();
})->purpose('Notifica documentos de aluno expirando em dias configurados')
->dailyAt('08:00');
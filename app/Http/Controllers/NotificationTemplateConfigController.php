<?php

namespace App\Http\Controllers;

use App\Http\Requests\NotificationTemplateConfig\CreateOrUpdateNotificattionTemplateConfigRequest;
use App\Services\Aws\Ses;
use Illuminate\Support\Facades\Auth;

class NotificationTemplateConfigController extends Controller
{
    public function store(CreateOrUpdateNotificattionTemplateConfigRequest $request)
    {
        $validated = $request->validated();

        $entity = Auth::user()->entity;
        
        $type = $validated['type'];

        unset($validated['type']);

        $nameFunction = $type == 'whatsapp' ? "notificationConfigWhatsapp" : "notificationConfigEmail";
        $nameColumn = $type == 'whatsapp' ? "notification_config_whatsapp_id" : "notification_config_email_id";
        $entity->load(['notificationConfigEmail']);
        
        $message = "Configurações registradas com sucesso";

        // $ses = new Ses();
     
        // if (!$ses->alreadVerified($validated['default_sender'])) {
        //     $message = "Foi encaminhado um código para o e-mail {$validated['default_sender']}";
        //     $ses->sendConfirmationLinkToSenderEmail($validated['default_sender']);
        // }

        $notificationConfig = $entity->$nameFunction()->updateOrCreate(['id' => $entity->$nameColumn], $validated);

        $entity->$nameColumn = $notificationConfig->id;
        $entity->save();

        return response()->json([
            "message" => $message
        ]);
    }
}

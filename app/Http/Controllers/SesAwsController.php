<?php

namespace App\Http\Controllers;

use App\Models\EmailBounce;
use App\Services\Aws\Ses;
use Illuminate\Http\Request;

class SesAwsController extends Controller
{
    public function handle(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        // Confirmação da assinatura SNS (necessário na 1ª vez)
        if (isset($data['Type']) && $data['Type'] === 'SubscriptionConfirmation') {
            file_get_contents($data['SubscribeURL']);
            return response('Subscription confirmed', 200);
        }

        // Trata bounces
        if ($data['Type'] === 'Notification') {
            $message = json_decode($data['Message'], true);

            if ($message['notificationType'] === 'Bounce') {
                foreach ($message['bounce']['bouncedRecipients'] as $recipient) {
                    EmailBounce::updateOrCreate(
                        ['email' => $recipient['emailAddress']],
                        ['reason' => 'bounce', 'created_at' => now()]
                    );
                }
            }

            if ($message['notificationType'] === 'Complaint') {
                foreach ($message['complaint']['complainedRecipients'] as $recipient) {
                    EmailBounce::updateOrCreate(
                        ['email' => $recipient['emailAddress']],
                        ['reason' => 'complaint', 'created_at' => now()]
                    );
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function verifyEmail(Request $request)
    {
        $ses = new Ses();

        if (!$ses->alreadVerified($request->email)) {
            $ses->sendConfirmationLinkToSenderEmail($request->email);
        }

        return response()->json([
            "message" => "Foi encaminhado um link de verificação para o e-mail {$request->email}"
        ]);
    }
}

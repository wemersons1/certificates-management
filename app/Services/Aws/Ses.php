<?php

namespace App\Services\Aws;

use Aws\Ses\SesClient;

class Ses
{
    private SesClient $ses;

    public function __construct()
    {
        $this->ses = new SesClient([
            'version' => '2010-12-01',
            'region' => env('AWS_DEFAULT_REGION_SES'),
            'credentials' => [
                'key'    => env('MAIL_USERNAME'),
                'secret' => env('MAIL_PASSWORD'),
            ],
        ]);
    }

    public function sendConfirmationLinkToSenderEmail($email)
    {
        try {
            $this->ses->verifyEmailIdentity([
                'EmailAddress' => $email,
            ]);
        } catch (\Aws\Exception\AwsException $e) {
            throw new \Exception($e->getAwsErrorMessage());
        }
    }

    public function alreadVerified($email)
    {
        try {
            // Buscar atributos de verificação
            $result = $this->ses->getIdentityVerificationAttributes([
                'Identities' => [$email],
            ]);

            $attrs = $result['VerificationAttributes'];
            
            return isset($attrs[$email]) && $attrs[$email]['VerificationStatus'] === 'Success';

        } catch (\Aws\Exception\AwsException $e) {
            throw new \Exception($e->getAwsErrorMessage());
        }
    }
}


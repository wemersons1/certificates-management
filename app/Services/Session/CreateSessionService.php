<?php

namespace App\Services\Session;

use App\Services\PasswordHash\PasswordHashCheckService;
use App\Services\User\FindUserByEmailService;

class CreateSessionService
{
    public function execute($data)
    {
        $emailRequest = $data['email'];
        $passwordRequest = $data['password'];

        $findUserByEmailService = new FindUserByEmailService();
        $user = $findUserByEmailService->execute($emailRequest);

        $passwordHashCheckService = new PasswordHashCheckService();
        $passwordMatch = $passwordHashCheckService->execute($passwordRequest, $user->password);

        if (! $user || ! $passwordMatch) {

            return null;
        }

        return $user->createToken($emailRequest)->plainTextToken;
    }
}

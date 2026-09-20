<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\PasswordHash\CreatePasswordHashService;

class CreateUserService
{
    public function execute($userData)
    {
        return $this->createUser($userData);
    }

    private function createUser($userData)
    {
        $createPasswordHashService = new CreatePasswordHashService();

        $userData['password'] = $createPasswordHashService->execute($userData['password']);
        $userData['email'] = strtolower($userData['email']);
        $userData['email_verified_at'] = date('Y-m-d H:i:s');

        return User::create($userData)
                    ->fresh();
    }
}

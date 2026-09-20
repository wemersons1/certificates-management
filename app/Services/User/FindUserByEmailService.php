<?php

namespace App\Services\User;

use App\Models\User;

class FindUserByEmailService
{
    public function execute($email)
    {
        $user = User::
                    where('email', $email)
                    ->first();
        return $user;
    }
}

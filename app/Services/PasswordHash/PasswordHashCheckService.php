<?php

namespace App\Services\PasswordHash;

use Illuminate\Support\Facades\Hash;

class PasswordHashCheckService
{
    public function execute($passwordToCheck, $passwordHash)
    {
        return Hash::check($passwordToCheck, $passwordHash);
    }
}

<?php

namespace App\Services\PasswordHash;

use Illuminate\Support\Facades\Hash;

class CreatePasswordHashService
{
    public function execute($password)
    {
        return Hash::make($password);
    }
}

<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\PasswordHash\CreatePasswordHashService;

class FindUserByIdService
{
    public function execute($userId)
    {
        return User::findOrFail($userId);
    }
}

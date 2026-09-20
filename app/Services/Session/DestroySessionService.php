<?php

namespace App\Services\Session;

use App\Models\User;

class DestroySessionService
{
    public function execute($userId)
    {
        $user = User::myScope()->find($userId);
        $user->currentAccessToken()->delete();
    }
}

<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\PasswordHash\CreatePasswordHashService;

class DestroyUserService
{
    public function execute($userId)
    {
        return $this->deleteUser($userId);
    }

    private function deleteUser($userId)
    {
        $findUserByIdService = new FindUserByIdService();

        $user = $findUserByIdService->execute($userId);

        $user->delete();
    }
}

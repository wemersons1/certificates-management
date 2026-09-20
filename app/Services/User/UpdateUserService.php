<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\PasswordHash\CreatePasswordHashService;

class UpdateUserService
{
    public function execute($userData, $id)
    {
        return $this->updateUser($userData, $id);
    }

    private function updateUser($userData, $id)
    {
        if (isset($userData['password']) && $userData['password']) {
            $createPasswordHashService = new CreatePasswordHashService();
            $userData['password'] = $createPasswordHashService->execute($userData['password']);
        } else {
            unset($userData['password']);
        }

        $user = User::myScope()->findOrFail($id);

        return $user->update($userData);
    }
}

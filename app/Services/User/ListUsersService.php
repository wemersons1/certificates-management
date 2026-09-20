<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\PasswordHash\CreatePasswordHashService;

class ListUsersService
{
    public function execute($filters)
    {
        return $this->listUsers($filters);
    }

    private function listUsers($filters)
    {
        $users = User::with(['client']);

        if(isset($filters['name'])) {
            $users = $users->where('name', 'LIKE', '%'.$filters['name'].'%');
        }

        if(isset($filters['email'])) {
            $users = $users->where('email', 'LIKE', '%'.$filters['email'].'%');
        }

        if(isset($filters['document'])) {
            $users = $users->where('document', 'LIKE', $filters['document'].'%');
        }

        if(isset($filters['profile_id']) && $filters['profile_id']) {
            $users = $users->where('profile_id', $filters['profile_id']);
        }

        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 15;

        return $users->orderBy('id', 'DESC')
                        ->paginate($perPage);
    }
}

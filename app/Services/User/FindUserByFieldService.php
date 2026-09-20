<?php

namespace App\Services\User;

use App\Models\User;

class FindUserByFieldService
{
    public function execute($data, $field)
    {
        $user = User::where($field, $data)
                    ->first();
        return $user;
    }
}

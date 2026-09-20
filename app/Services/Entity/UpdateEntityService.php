<?php

namespace App\Services\Entity;

use App\Models\Entity;

class UpdateEntityService
{
    public function execute($data, $id)
    {
        $entity = Entity::with(['config'])->updateOrCreate([
            'id' => $id
        ], $data);

        return $entity;
    }
}


<?php

namespace App\Services\Entity;

use App\Models\Entity;

class CreateEntityService
{
    public function execute($validated)
    {
        return Entity::create($validated);
    }
}


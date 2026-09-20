<?php

namespace App\Services\Employee;

use App\Models\Employee;

class CreateEmployeeService
{
    public function execute($data)
    {
        // Usa as mesmas colunas do índice único (entity_id + cpf + name)
        // para evitar SQLSTATE[23000] Duplicate entry
        $uniqueKeys = [
            'entity_id' => $data['entity_id'],
            'cpf'       => $data['cpf'] ?? null,
            'name'      => $data['name'],
        ];

        $fillable = array_diff_key($data, array_flip(['entity_id', 'cpf', 'name']));

        return Employee::updateOrCreate($uniqueKeys, $fillable);
    }
}


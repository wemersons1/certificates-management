<?php

namespace App\Services\Employee;

use App\Models\Employee;

class UpdateEmployeeService
{
    public function execute($data, $id)
    {
        $employee = Employee::myScope()->find($id);
        $employee->update($data);

        return $employee;
    }
}


<?php

namespace App\Services\EmailNotifications;

use App\Models\Employee;
use App\Mail\EmployeeBirthdayMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class EmployeeNotificationService
{
    /**
     * Envia e‑mail de aniversário para todos os alunos cujo
     * campo `birthday` não é nulo e coincide com dia e mês de hoje.
     */
    public function sendBirthdayNotifications(): void
    {
        $today = Carbon::today();

        $employees = Employee::query()
            ->whereNotNull('birthday')
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            ->get();

        foreach ($employees as $employee) {
            Mail::to($employee->email)
                ->queue(new EmployeeBirthdayMail($employee));
        }
    }
}

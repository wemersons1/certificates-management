<?php

namespace Database\Seeders;

use App\Enums\SystemMenuEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('system_menus')->insert([
            [
                'id' => SystemMenuEnum::DASHBOARD->value,
                'name' => 'Dashboard'
            ],
            [
                'id' => SystemMenuEnum::COMPANIES->value,
                'name' => 'Companies'
            ],
            [
                'id' => SystemMenuEnum::STUDENTS->value,
                'name' => 'Students'
            ],
            [
                'id' => SystemMenuEnum::CERTIFICATES->value,
                'name' => 'Certificates'
            ],
            [
                'id' => SystemMenuEnum::TEMPLATES->value,
                'name' => 'Templates'
            ],
            [
                'id' => SystemMenuEnum::INSTRUCTORS->value,
                'name' => 'Instructors'
            ],
            [
                'id' => SystemMenuEnum::POSITIONS->value,
                'name' => 'Positions'
            ],
            [
                'id' => SystemMenuEnum::COURSES->value,
                'name' => 'Courses'
            ],
            [
                'id' => SystemMenuEnum::USERS->value,
                'name' => 'Users'
            ],
            [
                'id' => SystemMenuEnum::NOTIFICATIONS->value,
                'name' => 'Notifications'
            ],
            [
                'id' => SystemMenuEnum::SENT_EMAILS->value,
                'name' => 'SentEmails'
            ],
            [
                'id' => SystemMenuEnum::AUDIT_LOGS->value,
                'name' => 'AuditLogs'
            ]
        ]);
    }
}

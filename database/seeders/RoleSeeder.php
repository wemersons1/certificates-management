<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'id' => RoleEnum::MASTER->value,
                'name' => 'Master'
            ],
            [
                'id' => RoleEnum::ENTITY->value,
                'name' => 'Entity'
            ],
            [
                'id' => RoleEnum::COMPANY->value,
                'name' => 'Company'
            ],
            [
                'id' => RoleEnum::EMPLOYEE->value,
                'name' => 'Employee'
            ],
            [
                'id' => RoleEnum::LEAD->value,
                'name' => 'Lead'
            ]
        ]);
    }
}

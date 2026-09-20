<?php

namespace Database\Seeders;

use App\Enums\UserPermissionEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('user_permissions')->insert([
            [
                'id' => UserPermissionEnum::CREATE->value,
                'name' => 'Cadastrar'
            ],
            [
                'id' => UserPermissionEnum::UPDATE->value,
                'name' => 'Atualizar'
            ],
            [
                'id' => UserPermissionEnum::DELETE->value,
                'name' => 'Excluir'
            ]
        ]);
    }
}

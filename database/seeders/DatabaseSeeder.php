<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            GenderSeeder::class,
            DocumentTemplateTypeSeeder::class,
            UserPermissionSeeder::class,
            PlanBenefitSeeder::class,
            EntityStatusSeeder::class,
            SystemMenuSeeder::class,
            CreditPackageSeeder::class
        ]);

        Company::factory(20)->create();
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'master@test.com',
            'password' => 'Le12_vem',
            'role_id' => \App\Enums\RoleEnum::MASTER->value
        ]);
    }
}

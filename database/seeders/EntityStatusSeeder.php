<?php

namespace Database\Seeders;

use App\Enums\EntityStatusEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntityStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('entity_statuses')->insert([
            [
                'id' => EntityStatusEnum::COMPLIENT->value,
                'name' => 'Adimplente',
            ],
            [
                'id' => EntityStatusEnum::DEFAULTER->value,
                'name' => 'Inadimplente',
            ],
        ]);
    }
}

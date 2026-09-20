<?php

namespace Database\Seeders;

use App\Enums\GenderEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('genders')->insert([
            [
                'id' => GenderEnum::MALE->value,
                'name' => 'Masculino',
            ],
            [
                'id' => GenderEnum::FEMALE->value,
                'name' => 'Feminino',
            ],
            [
                'id' => GenderEnum::NON_BINARY->value,
                'name' => 'Não binário',
            ],
            [
                'id' => GenderEnum::OTHER->value,
                'name' => 'Outro',
            ],
            [
                'id' => GenderEnum::PREFER_NOT_TO_SAY->value,
                'name' => 'Prefere não informar',
            ],
        ]);
    }
}

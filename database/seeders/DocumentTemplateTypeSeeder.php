<?php

namespace Database\Seeders;

use App\Enums\DocumentTemplateTypeEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTemplateTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('document_template_types')->insert([
            [
                'id' => DocumentTemplateTypeEnum::CERTIFICATE->value,
                'name' => 'Certificado'
            ],
            [
                'id' => DocumentTemplateTypeEnum::PRESENCE_LIST->value,
                'name' => 'Lista de presença'
            ],
            [
                'id' => DocumentTEmplateTypeEnum::CONSENT->value,
                'name' => 'Autorização/Anuência'
            ],
        ]);
    }
}

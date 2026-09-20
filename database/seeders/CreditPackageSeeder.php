<?php

namespace Database\Seeders;

use App\Models\CreditPackage;
use Illuminate\Database\Seeder;

class CreditPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CreditPackage::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Certificado Avulso',
                'credits' => 1,
                'price' => 0.99,
                'validity_days' => 30,
                'active' => true
            ]
        );

        CreditPackage::updateOrCreate(
            ['id' => 2],
            [
                'name' => 'Pacote Bronze',
                'credits' => 10,
                'price' => 8.90,
                'validity_days' => 30,
                'active' => true
            ]
        );

        CreditPackage::updateOrCreate(
            ['id' => 3],
            [
                'name' => 'Pacote Prata',
                'credits' => 50,
                'price' => 39.90,
                'validity_days' => 30,
                'active' => true
            ]
        );

        CreditPackage::updateOrCreate(
            ['id' => 4],
            [
                'name' => 'Pacote Ouro',
                'credits' => 100,
                'price' => 69.90,
                'validity_days' => 30,
                'active' => true
            ]
        );
    }
}

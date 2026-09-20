<?php

namespace Database\Factories;

use App\Models\Entity;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        Entity::factory(10)->create();

        $entity = Entity::first();

        return [
            'name' => Str::random(10),
            'email' => Str::random(10).'@example.com',
            'cnpj' => rand(11111111111111,99999999999999),
            'entity_id' => $entity->id
        ];
    }
}

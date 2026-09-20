<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('business_segments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Populate default segments
        DB::table('business_segments')->insert([
            ['name' => 'Educação e Cursos Livres', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Treinamento Corporativo', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Segurança do Trabalho (SST)', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ensino Superior ou Técnico', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Eventos e Congressos', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Saúde e Bem-estar', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Infoprodutos', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Conselhos e Associações', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Outros', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_segments');
    }
};

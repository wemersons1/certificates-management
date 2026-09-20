<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
            // O nome do índice a ser removido é 'nome_da_tabela_name_entity_id_unique'
            $table->dropUnique(['name', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
            // Para reverter, recriamos a restrição
            $table->unique(['name', 'entity_id']);
        });
    }
};

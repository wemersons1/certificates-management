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
        Schema::table('courses', function (Blueprint $table) {
            $table->dropUnique(['name', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * O método 'down' deve reverter o que 'up' fez.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Adiciona o índice 'unique' de volta à coluna 'name' para reverter a alteração.
            $table->unique(['name', 'entity_id']);
        });
    }
};
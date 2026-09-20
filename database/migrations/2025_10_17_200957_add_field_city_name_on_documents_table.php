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
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'city_name')) {
                $table->string('city_name')->nullable()->after('entity_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
            // Verifica se a coluna existe antes de tentar removê-la
            if (Schema::hasColumn('documents', 'city_name')) {
                $table->dropColumn('city_name');;
            }
        });
    }
};

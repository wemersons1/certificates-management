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
            if (!Schema::hasColumn('instructors', 'deleted_at')) {
                $table->softDeletes(); 
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
            if (Schema::hasColumn('instructors', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
        });
    }
};

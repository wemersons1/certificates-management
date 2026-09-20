<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('employees')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'cpf')) {
                $table->string('cpf')->nullable()->after('email');
            }

            if (!Schema::hasColumn('employees', 'position')) {
                $table->string('position')->nullable()->after('cellphone');
            }
        });
    }

    public function down(): void
    {
        // This migration is defensive and may run on databases that already
        // had these columns; avoid dropping them on rollback.
    }
};

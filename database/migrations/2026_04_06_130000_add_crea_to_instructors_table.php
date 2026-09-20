<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('instructors')) {
            return;
        }

        Schema::table('instructors', function (Blueprint $table) {
            if (!Schema::hasColumn('instructors', 'crea')) {
                $table->string('crea')->default('')->after('formation');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('instructors')) {
            return;
        }

        Schema::table('instructors', function (Blueprint $table) {
            if (Schema::hasColumn('instructors', 'crea')) {
                $table->dropColumn('crea');
            }
        });
    }
};

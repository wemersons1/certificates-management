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
            if (Schema::hasColumn('instructors', 'formation')) {
                $table->string('formation')->nullable()->change();
            }

            if (Schema::hasColumn('instructors', 'crea')) {
                $table->string('crea')->nullable()->default(null)->change();
            }

            if (Schema::hasColumn('instructors', 'description')) {
                $table->text('description')->nullable()->change();
            }

            if (Schema::hasColumn('instructors', 'stamp')) {
                $table->string('stamp')->nullable()->change();
            }

            if (Schema::hasColumn('instructors', 'signature')) {
                $table->string('signature')->nullable()->change();
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
                $table->string('crea')->default('')->nullable(false)->change();
            }
        });
    }
};

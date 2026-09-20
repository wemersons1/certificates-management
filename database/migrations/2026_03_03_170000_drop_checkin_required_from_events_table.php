<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('events', 'checkin_required')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('checkin_required');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('events', 'checkin_required')) {
            Schema::table('events', function (Blueprint $table) {
                $table->boolean('checkin_required')->default(false)->after('is_remote');
            });
        }
    }
};

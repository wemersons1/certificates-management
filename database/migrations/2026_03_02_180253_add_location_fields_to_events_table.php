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
        if (!Schema::hasColumn('events', 'checkin_nearby_only')) {
            Schema::table('events', function (Blueprint $table) {
                $table->boolean('checkin_nearby_only')->default(false)->after('checkin_required');
            });
        }

        if (!Schema::hasColumn('events', 'latitude')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('latitude')->nullable()->after('location');
            });
        }

        if (!Schema::hasColumn('events', 'longitude')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('longitude')->nullable()->after('latitude');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('events', 'checkin_nearby_only')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('checkin_nearby_only');
            });
        }

        if (Schema::hasColumn('events', 'latitude')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('latitude');
            });
        }

        if (Schema::hasColumn('events', 'longitude')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('longitude');
            });
        }
    }
};

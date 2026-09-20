<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('events', 'checkin_media_only')) {
            Schema::table('events', function (Blueprint $table) {
                $table->boolean('checkin_media_only')->default(false)->after('checkin_nearby_only');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('events', 'checkin_media_only')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('checkin_media_only');
            });
        }
    }
};

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
        if (!Schema::hasColumn('events', 'location_search_query')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('location_search_query', 500)->nullable()->after('location');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('events', 'location_search_query')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropColumn('location_search_query');
            });
        }
    }
};

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
        Schema::table('entities', function (Blueprint $table) {
            $table->unsignedBigInteger('business_segment_id')->nullable()->after('city_id');
            $table->foreign('business_segment_id')->references('id')->on('business_segments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entities', function (Blueprint $table) {
            $table->dropForeign(['business_segment_id']);
            $table->dropColumn('business_segment_id');
        });
    }
};

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
        Schema::table('document_template_frames', function (Blueprint $table) {
            $table->text('back_frame')->nullable()->after('frame');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_template_frames', function (Blueprint $table) {
            $table->dropColumn('back_frame');
        });
    }
};

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
        Schema::table('document_template_versions', function (Blueprint $table) {
            if (!Schema::hasColumn('document_template_versions', 'frame_id')) {
                $table->unsignedBigInteger('frame_id')->nullable()->after('id');

                $table->foreign('frame_id')
                    ->references('id')
                    ->on('document_template_frames')
                    ->onDelete('set null'); // opcional: seta null se o frame for excluído
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_template_versions', function (Blueprint $table) {
            if (Schema::hasColumn('document_template_versions', 'frame_id')) {
                $table->dropForeign(['frame_id']);
                $table->dropColumn('frame_id');
            }
        });
    }
};

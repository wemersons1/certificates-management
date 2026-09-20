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
            if (!Schema::hasColumn('document_template_versions', 'back_document')) {
                $table->text('back_document')->after('template')->nullable();            
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_template_versions', function (Blueprint $table) {
            $table->dropColumn('back_document');
        });
    }
};

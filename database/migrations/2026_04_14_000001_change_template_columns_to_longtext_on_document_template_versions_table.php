<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_template_versions', function (Blueprint $table) {
            $table->longText('template')->nullable()->change();
            $table->longText('back_document')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('document_template_versions', function (Blueprint $table) {
            $table->text('template')->nullable()->change();
            $table->text('back_document')->nullable()->change();
        });
    }
};

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
        Schema::create('document_template_versions', function (Blueprint $table) {
            $table->id();

            $table->text('template');
            
            $table->enum('orientation', ['portrait', 'landscape']);

            $table->unsignedBigInteger('document_template_id');
            $table->foreign('document_template_id')->references('id')->on('document_templates');

            $table->unsignedBigInteger('type_id');
            $table->foreign('type_id')->references('id')->on('document_template_types');
            
            $table->string('frame_color')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_template_versions');
    }
};

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
        Schema::create('document_template_frames', function (Blueprint $table) {
            $table->id();

            $table->text('frame')->nullable();

            $table->boolean('is_top_only')->default(false);
            
            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');
            
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_template_frames');
    }
};

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
        Schema::create('plan_has_benefits', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('plan_version_id');
            $table->foreign('plan_version_id')->references('id')->on('plan_versions');

            $table->unsignedBigInteger('benefit_id');
            $table->foreign('benefit_id')->references('id')->on('plan_benefits');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_has_benefits');
    }
};

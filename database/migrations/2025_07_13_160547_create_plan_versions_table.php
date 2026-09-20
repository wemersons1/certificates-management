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
        Schema::create('plan_versions', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->unsignedBigInteger('plan_id');
            $table->foreign('plan_id')->references('id')->on('plans');

            $table->integer('monthly_value')->nullable();
            $table->integer('annual_value')->nullable();
            $table->string('image');
            $table->integer('quantity_days');
            $table->integer('quantity_certificates');
            $table->string('mercadopago_preapproval_plan_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_versions');
    }
};

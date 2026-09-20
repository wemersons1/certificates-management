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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');

            $table->unsignedBigInteger('plan_version_id');
            $table->foreign('plan_version_id')->references('id')->on('plan_versions');

            $table->integer('value')->nullable();

            $table->enum('payment_form', ['credit_card', 'credit_recurrence', 'pix'])->nullable();

            $table->enum('status', ['pending', 'completed', 'cancelled']);
            $table->enum('periodicity', ['monthly', 'annual']);

            $table->string('mercadopago_preapproval_id')->nullable();
            $table->string('external_reference')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

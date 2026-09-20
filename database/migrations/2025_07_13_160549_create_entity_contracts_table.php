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
        Schema::create('entity_contracts', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->unsignedBigInteger('plan_version_id');
            $table->foreign('plan_version_id')->references('id')->on('plan_versions');

            $table->date('activation_date');
            $table->date('expiration_date');
            $table->dateTime('cancelation_date')->nullable();

            $table->string('due_date')->nullable();

            $table->integer('value');
            $table->enum('periodicity', ['monthly', 'annual']);

            $table->unsignedBigInteger('registered_by');
            $table->foreign('registered_by')->references('id')->on('users');

            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')->references('id')->on('orders');

            $table->enum('payment_form', ['credit_card', 'credit_recurrence', 'pix'])->nullable();

            $table->unsignedBigInteger('upgrade_contract_id')->nullable();
            $table->foreign('upgrade_contract_id')->references('id')->on('entity_contracts');

            $table->enum('status', ['finished', 'cancelled', 'active']);

            $table->string('mercadopago_preapproval_id')->nullable();
            $table->string('external_reference')->nullable();

            $table->longText('description_cancellation')->nullable();
            $table->longText('description_finalization')->nullable();//POIS ELE PODE TER FEITO UPGRADE OU QUALQUER OUTRO EVENTO

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entity_contracts');
    }
};

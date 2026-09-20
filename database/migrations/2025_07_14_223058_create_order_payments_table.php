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
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')->references('id')->on('orders');

            $table->integer('value');
            $table->enum('payment_form', ['pix', 'credit_card', 'credit_card_recurrence']);

            $table->enum('payment_status', [
                'pending',
                'approved',
                'inprocess',
                'inmediation',
                'rejected',
                'cancelled',
                'refunded',
                'chargedback',
            ]);

            $table->char('reference', 7);
            $table->date('due_date')->nullable();
            $table->string('mercadopago_operation_id')->nullable();
            $table->string('mercadopago_operation_type')->nullable();
            $table->string('mercadopago_status')->nullable();
            $table->string('mercadopago_status_detail')->nullable();
            $table->dateTime('mercadopago_date_created')->nullable();
            $table->dateTime('mercadopago_date_approved')->nullable();
            $table->dateTime('mercadopago_date_of_expiration')->nullable();
            $table->string('mercadopago_money_release_date')->nullable();
            $table->string('mercadopago_payment_method_id')->nullable();
            $table->string('mercadopago_installments')->nullable();
            $table->longText('mercadopago_pix_qrcode')->nullable();
            $table->longText('mercadopago_ticket_url')->nullable();
            $table->longText('mercadopago_copy_and_past')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};

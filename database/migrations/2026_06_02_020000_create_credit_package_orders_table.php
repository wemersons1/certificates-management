<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('credit_package_orders')) {
            Schema::create('credit_package_orders', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('credit_package_id')->constrained()->onDelete('restrict');
                $table->decimal('value', 10, 2);         // in BRL
                $table->string('payment_form');          // 'pix' | 'credit_card'
                $table->string('status')->default('pending'); // pending | approved | rejected | cancelled
                $table->string('mercadopago_operation_id')->nullable();
                $table->string('mercadopago_operation_type')->nullable();
                $table->string('payment_status')->nullable();
                $table->string('mercadopago_status_detail')->nullable();
                $table->timestamp('mercadopago_date_created')->nullable();
                $table->timestamp('mercadopago_date_approved')->nullable();
                $table->timestamp('mercadopago_date_of_expiration')->nullable();
                $table->text('mercadopago_pix_qrcode')->nullable();
                $table->text('mercadopago_copy_and_past')->nullable();
                $table->string('mercadopago_ticket_url')->nullable();
                $table->string('mercadopago_payment_method_id')->nullable();
                $table->integer('mercadopago_installments')->nullable();
                $table->boolean('credits_granted')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_package_orders');
    }
};

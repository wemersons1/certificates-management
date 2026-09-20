<?php

use App\Enums\EntityStatusEnum;
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
        Schema::create('entities', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email');
            $table->char('cnpj', 14);

            $table->unsignedBigInteger('config_id')->nullable();
            $table->foreign('config_id')->references('id')->on('entity_configs');

            $table->unsignedBigInteger('notification_config_whatsapp_id')->nullable();
            $table->foreign('notification_config_whatsapp_id')->references('id')->on('notification_template_configs');

            $table->unsignedBigInteger('notification_config_email_id')->nullable();
            $table->foreign('notification_config_email_id')->references('id')->on('notification_template_configs');

            $table->unsignedBigInteger('status_id')->default(EntityStatusEnum::DEFAULTER->value);
            $table->foreign('status_id')->references('id')->on('entity_statuses');

            $table->char('zip_code', 8)->nullable();
            $table->string('street')->nullable();
            $table->char('number', 20)->nullable();
            $table->string('complement')->nullable();
            $table->string('neighborhood')->nullable();

            $table->integer('state_id')->nullable();
            $table->integer('city_id')->nullable();

            $table->softDeletes();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entities');
    }
};

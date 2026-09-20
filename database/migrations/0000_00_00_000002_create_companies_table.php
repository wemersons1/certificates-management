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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->nullable();
            $table->string('name');
            $table->string('email')->nullable();
            $table->char('cnpj', 14);
            $table->char('phone', 14)->nullable();
            $table->char('cellphone', 14)->nullable();

            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->char('zip_code', 8)->nullable();
            $table->string('street')->nullable();
            $table->char('number', 20)->nullable();
            $table->string('complement')->nullable();
            $table->string('neighborhood')->nullable();

            $table->integer('state_id')->nullable();
            $table->integer('city_id')->nullable();
            $table->boolean('active')->default(true);

            $table->unique(['external_id', 'entity_id', 'cnpj']);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};

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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(true);
            $table->string('external_id')->nullable();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('cpf')->nullable();
            $table->string('rg')->nullable();
            $table->string('emitting_organ')->nullable();
            $table->string('birthday')->nullable();
            $table->string('phone')->nullable();
            $table->string('cellphone')->nullable();
            $table->string('position')->nullable();
            $table->string('machines_operated')->nullable();

            $table->char('zip_code', 8)->nullable();
            $table->string('street')->nullable();
            $table->char('number', 20)->nullable();
            $table->string('complement')->nullable();
            $table->string('neighborhood')->nullable();

            $table->integer('state_id')->nullable();
            $table->integer('city_id')->nullable();

            $table->unsignedBigInteger('entity_id')->nullable();
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreign('company_id')->references('id')->on('companies');

            $table->unsignedBigInteger('gender_id')->nullable();
            $table->foreign('gender_id')->references('id')->on('genders');

            $table->unique(['company_id', 'cpf']);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};

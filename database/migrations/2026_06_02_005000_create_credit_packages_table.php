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
        if (!Schema::hasTable('credit_packages')) {
            Schema::create('credit_packages', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('credits');
                $table->decimal('price', 10, 2);
                $table->integer('validity_days')->default(30);
                $table->boolean('active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_packages');
    }
};

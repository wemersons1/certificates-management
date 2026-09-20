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
        Schema::create('presence_list_has_employees', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('presence_list_id');
            $table->foreign('presence_list_id')->references('id')->on('presence_lists');

            $table->unsignedBigInteger('employee_id');
            $table->foreign('employee_id')->references('id')->on('presence_lists');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presence_list_has_employees');
    }
};

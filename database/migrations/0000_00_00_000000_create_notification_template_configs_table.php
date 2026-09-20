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
        Schema::create('notification_template_configs', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->longText('content');
            $table->boolean('active');
            $table->boolean('send_me');
            $table->longText('company_ids')->nullable();
            $table->longText('employee_ids')->nullable();
            $table->string('default_sender');
            $table->tinyInteger('quantity_days_for_notification');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_template_configs');
    }
};

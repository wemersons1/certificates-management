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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('method')->comment('HTTP method: GET, POST, PUT, DELETE, PATCH');
            $table->string('route')->comment('Route or endpoint accessed');
            $table->text('url')->comment('Full URL');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable()->comment('Browser user agent');
            $table->json('request_data')->nullable()->comment('Request payload');
            $table->json('response_data')->nullable()->comment('Response data');
            $table->integer('response_status')->nullable()->comment('HTTP response code');
            $table->text('description')->nullable()->comment('Additional description');
            $table->decimal('execution_time', 8, 3)->nullable()->comment('Request execution time in ms');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
            $table->index(['method', 'created_at']);
            $table->index(['route', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

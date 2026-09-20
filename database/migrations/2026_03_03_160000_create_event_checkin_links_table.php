<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('event_checkin_links')) {
            Schema::create('event_checkin_links', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->uuid('token')->unique();
                $table->timestamp('used_at')->nullable();
                $table->string('used_by_name')->nullable();
                $table->string('used_by_email')->nullable();
                $table->unsignedBigInteger('generated_document_id')->nullable();
                $table->string('issued_ip', 45)->nullable();
                $table->text('issued_user_agent')->nullable();
                $table->timestamps();

                $table->foreign('generated_document_id')->references('id')->on('documents')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('event_checkin_links');
    }
};

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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->dateTime('date_start');
            $table->boolean('checkin_required')->default(false);
            $table->text('location')->nullable();
            $table->string('media_path')->nullable();
            $table->string('media_type')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('event_instructor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('instructors')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_instructor');
        Schema::dropIfExists('events');
    }
};

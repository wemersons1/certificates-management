<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_signatures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->string('url');            // S3 URL of the signature image
            $table->float('x')->default(50);  // left position in %
            $table->float('y')->default(75);  // top position in %
            $table->integer('width')->default(140); // width in px
            $table->integer('page')->default(1);    // certificate page (1 or 2)
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_signatures');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_logos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->string('url');           // S3 URL of the logo image
            $table->float('x')->default(58); // left position in %
            $table->float('y')->default(8);  // top position in %
            $table->integer('width')->default(130); // width in px
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->unique('course_id'); // one logo per course
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_logos');
    }
};

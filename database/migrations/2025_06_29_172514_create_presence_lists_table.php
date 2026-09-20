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
        Schema::create('presence_lists', function (Blueprint $table) {
            $table->id();

            $table->uuid();

            $table->char('number_of_hours_studied', 4);

            $table->text('course_period');//irá armazenar os períodos estudados, array de datas, período inicial e final

            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')->references('id')->on('courses');

            $table->unsignedBigInteger('presence_list_template_version_id')->nullable();
            $table->foreign('presence_list_template_version_id')->references('id')->on('document_template_versions');            

            $table->integer('city_id')->nullable();

            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presence_lists');
    }
};

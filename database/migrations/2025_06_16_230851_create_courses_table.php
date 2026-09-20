<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('content_program');
            $table->char('number_of_hours_studied', 5);

            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->unsignedBigInteger('certificate_id')->nullable();
            $table->foreign('certificate_id')->references('id')->on('document_templates');

            $table->unsignedBigInteger('authorization_id')->nullable();
            $table->foreign('authorization_id')->references('id')->on('document_templates');

            $table->unsignedBigInteger('presence_list_id')->nullable();
            $table->foreign('presence_list_id')->references('id')->on('document_templates');

            $table->unique(['name', 'entity_id']);
            
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('table_courses');
    }
}

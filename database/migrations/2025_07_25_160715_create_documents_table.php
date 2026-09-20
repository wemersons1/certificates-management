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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            $table->uuid();
            
            $table->longText('content_program');
           
            $table->date('date_init_validate');
            $table->date('date_end_validate');

            $table->date('issue_date');

            $table->unsignedBigInteger('employee_id');
            $table->foreign('employee_id')->references('id')->on('employees');

            $table->unsignedBigInteger('position_id')->nullable();
            $table->foreign('position_id')->references('id')->on('positions');

            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')->references('id')->on('courses');

            $table->unsignedBigInteger('certificate_template_version_id');
            $table->foreign('certificate_template_version_id')->references('id')->on('document_template_versions');

            $table->unsignedBigInteger('authorization_template_version_id')->nullable();
            $table->foreign('authorization_template_version_id')->references('id')->on('document_template_versions');

            $table->unsignedBigInteger('registered_by_id');
            $table->foreign('registered_by_id')->references('id')->on('users');

            $table->unsignedBigInteger('presence_list_id')->nullable();
            $table->foreign('presence_list_id')->references('id')->on('presence_lists');

            $table->unsignedBigInteger('entity_id');
            $table->foreign('entity_id')->references('id')->on('entities');

            $table->boolean('have_employee_signature');

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

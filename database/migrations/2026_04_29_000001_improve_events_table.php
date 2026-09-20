<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'is_remote',
                'date_start',
                'location',
                'location_search_query',
                'latitude',
                'longitude',
                'checkin_nearby_only',
            ]);

            $table->renameColumn('checkin_media_only', 'validate_with_selfie');

            $table->unsignedSmallInteger('number_of_hours')->nullable()->after('course_id');
            $table->json('periods')->nullable()->after('number_of_hours');
            $table->string('company_name')->nullable()->after('periods');
            $table->string('city_name')->nullable()->after('company_name');
            $table->date('date_init_validate')->nullable()->after('city_name');
            $table->date('date_end_validate')->nullable()->after('date_init_validate');
            $table->date('issue_date')->nullable()->after('date_end_validate');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'number_of_hours',
                'periods',
                'company_name',
                'city_name',
                'date_init_validate',
                'date_end_validate',
                'issue_date',
            ]);

            $table->renameColumn('validate_with_selfie', 'checkin_media_only');

            $table->boolean('is_remote')->default(false);
            $table->dateTime('date_start')->nullable();
            $table->text('location')->nullable();
            $table->string('location_search_query', 500)->nullable();
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->boolean('checkin_nearby_only')->default(false);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'uuid')) {
                $table->uuid('uuid')->nullable()->after('id');
            }
        });

        DB::table('events')
            ->whereNull('uuid')
            ->orderBy('id')
            ->chunkById(200, function ($events) {
                foreach ($events as $event) {
                    DB::table('events')
                        ->where('id', $event->id)
                        ->update(['uuid' => (string) Str::uuid()]);
                }
            });

        Schema::table('events', function (Blueprint $table) {
            $table->unique('uuid');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};

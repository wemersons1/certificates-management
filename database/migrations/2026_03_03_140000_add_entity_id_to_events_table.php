<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('events', 'entity_id')) {
            Schema::table('events', function (Blueprint $table) {
                $table->unsignedBigInteger('entity_id')->nullable()->after('course_id');
                $table->foreign('entity_id')->references('id')->on('entities');
            });
        }

        $courseEntityMap = DB::table('courses')->pluck('entity_id', 'id');

        DB::table('events')
            ->whereNull('entity_id')
            ->orderBy('id')
            ->chunkById(200, function ($events) use ($courseEntityMap) {
                foreach ($events as $event) {
                    $entityId = $courseEntityMap[$event->course_id] ?? null;
                    if ($entityId) {
                        DB::table('events')
                            ->where('id', $event->id)
                            ->update(['entity_id' => $entityId]);
                    }
                }
            });
    }

    public function down(): void
    {
        if (Schema::hasColumn('events', 'entity_id')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropForeign(['entity_id']);
                $table->dropColumn('entity_id');
            });
        }
    }
};

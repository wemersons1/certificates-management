<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('checkin_code', 6)->nullable()->unique()->after('uuid');
        });

        $events = DB::table('events')->whereNull('checkin_code')->get(['id']);
        foreach ($events as $event) {
            $code = $this->generateUniqueCode();
            DB::table('events')->where('id', $event->id)->update(['checkin_code' => $code]);
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('checkin_code');
        });
    }

    private function generateUniqueCode(): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        do {
            $code = '';
            for ($i = 0; $i < 4; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (DB::table('events')->where('checkin_code', $code)->exists());

        return $code;
    }
};

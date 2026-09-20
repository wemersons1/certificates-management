<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('states', function (Blueprint $table){
            $table->integer('id')->unsigned()->primary(); //Padrão IBGE
            $table->string('nome');
            $table->string('sigla',2);
            $table->integer('regiao_id')->unsigned();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('states');
    }
}

<?php

use App\Models\State;
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
        State::create(['id' => 11, 'nome' => 'Rondônia', 'sigla' => 'RO', 'regiao_id' => 1]);
        State::create(['id' => 12, 'nome' => 'Acre', 'sigla' => 'AC', 'regiao_id' => 1]);
        State::create(['id' => 13, 'nome' => 'Amazonas', 'sigla' => 'AM', 'regiao_id' => 1]);
        State::create(['id' => 14, 'nome' => 'Roraima', 'sigla' => 'RR', 'regiao_id' => 1]);
        State::create(['id' => 15, 'nome' => 'Pará', 'sigla' => 'PA', 'regiao_id' => 1]);
        State::create(['id' => 16, 'nome' => 'Amapá', 'sigla' => 'AP', 'regiao_id' => 1]);
        State::create(['id' => 17, 'nome' => 'Tocantins', 'sigla' => 'TO', 'regiao_id' => 1]);
        State::create(['id' => 21, 'nome' => 'Maranhão', 'sigla' => 'MA', 'regiao_id' => 2]);
        State::create(['id' => 22, 'nome' => 'Piauí', 'sigla' => 'PI', 'regiao_id' => 2]);
        State::create(['id' => 23, 'nome' => 'Ceará', 'sigla' => 'CE', 'regiao_id' => 2]);
        State::create(['id' => 24, 'nome' => 'Rio Grande do Norte', 'sigla' => 'RN', 'regiao_id' => 2]);
        State::create(['id' => 25, 'nome' => 'Paraíba', 'sigla' => 'PB', 'regiao_id' => 2]);
        State::create(['id' => 26, 'nome' => 'Pernambuco', 'sigla' => 'PE', 'regiao_id' => 2]);
        State::create(['id' => 27, 'nome' => 'Alagoas', 'sigla' => 'AL', 'regiao_id' => 2]);
        State::create(['id' => 28, 'nome' => 'Sergipe', 'sigla' => 'SE', 'regiao_id' => 2]);
        State::create(['id' => 29, 'nome' => 'Bahia', 'sigla' => 'BA', 'regiao_id' => 2]);
        State::create(['id' => 31, 'nome' => 'Minas Gerais', 'sigla' => 'MG', 'regiao_id' => 3]);
        State::create(['id' => 32, 'nome' => 'Espírito Santo', 'sigla' => 'ES', 'regiao_id' => 3]);
        State::create(['id' => 33, 'nome' => 'Rio de Janeiro', 'sigla' => 'RJ', 'regiao_id' => 3]);
        State::create(['id' => 35, 'nome' => 'São Paulo', 'sigla' => 'SP', 'regiao_id' => 3]);
        State::create(['id' => 41, 'nome' => 'Paraná', 'sigla' => 'PR', 'regiao_id' => 4]);
        State::create(['id' => 42, 'nome' => 'Santa Catarina', 'sigla' => 'SC', 'regiao_id' => 4]);
        State::create(['id' => 43, 'nome' => 'Rio Grande do Sul', 'sigla' => 'RS', 'regiao_id' => 4]);
        State::create(['id' => 50, 'nome' => 'Mato Grosso do Sul', 'sigla' => 'MS', 'regiao_id' => 5]);
        State::create(['id' => 51, 'nome' => 'Mato Grosso', 'sigla' => 'MT', 'regiao_id' => 5]);
        State::create(['id' => 52, 'nome' => 'Goiás', 'sigla' => 'GO', 'regiao_id' => 5]);
        State::create(['id' => 53, 'nome' => 'Distrito Federal', 'sigla' => 'DF', 'regiao_id' => 5]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        State::truncate();
    }
};

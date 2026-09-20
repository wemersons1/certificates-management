<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // 3. Cria o índice UNIQUE correto
            $table->unique(
                ['entity_id', 'cpf', 'name'],
                'employees_entity_id_cpf_name_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {

            // Remove o índice novo
            $table->dropUnique('employees_entity_id_cpf_name_unique');

            // Restaura o índice antigo
            $table->unique(
                ['company_id', 'cpf'],
                'employees_company_id_cpf_unique'
            );

            // Restaura a foreign key
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->cascadeOnDelete();
        });
    }
};

<?php

namespace Database\Seeders;

use App\Enums\PlanBenefitEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanBenefitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plan_benefits')->insert([
            [
                'id' => PlanBenefitEnum::EMISSAO_AUTOMATIZADA->value,
                'name' => 'Emissão automatizada',
            ],
            [
                'id' => PlanBenefitEnum::IMPORTACAO_DADOS->value,
                'name' => 'Importação de alunos',
            ],
            [
                'id' => PlanBenefitEnum::NOTIFICACAO_VENCIMENTO->value,
                'name' => 'Notificação de vencimento',
            ],
            [
                'id' => PlanBenefitEnum::ASSINATURA_DINAMICA_INSTRUTOR->value,
                'name' => 'Assinatura dinâmica do instrutor',
            ],
            [
                'id' => PlanBenefitEnum::SUPORTE->value,
                'name' => 'Suporte',
            ],
            [
                'id' => PlanBenefitEnum::VALIDACAO_ONLINE->value,
                'name' => 'Validação online',
            ],
            [
                'id' => PlanBenefitEnum::ACESSO_ONLINE_CLIENTES->value,
                'name' => 'Acesso online para clientes',
            ],
            [
                'id' => PlanBenefitEnum::ENVIO_CERTIFICADO_EMAIL->value,
                'name' => 'Envio de certificado por e-mail',
            ],
        ]);
    }
}

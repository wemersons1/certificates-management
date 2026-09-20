<?php
namespace App\Enums;

enum PlanBenefitEnum: int
{
    case EMISSAO_AUTOMATIZADA = 1;
    case IMPORTACAO_DADOS = 2;
    case NOTIFICACAO_VENCIMENTO = 3;
    case ASSINATURA_DINAMICA_INSTRUTOR = 4;
    case SUPORTE = 5;
    case VALIDACAO_ONLINE = 6;
    case ACESSO_ONLINE_CLIENTES = 7;
    case ENVIO_CERTIFICADO_EMAIL = 8;
}

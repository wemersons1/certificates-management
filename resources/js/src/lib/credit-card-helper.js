export const translateMessageError = (message) => {
    switch (message) {
        // Mensagens do Mercado Pago que você já tinha ou solicitou ajuste
        case "expirationYear should be of length '2' or '4'.":
            return 'O ano de expiração deve ter 2 ou 4 dígitos.';
        case 'parameter cardholderName can not be null/empty':
            return "O nome do titular do cartão não pode ser vazio.";
        case `expirationYear value should be greater or equal than ${new Date().getFullYear()}.`:
            return `O ano de expiração deve ser maior ou igual a ${new Date().getFullYear()}.`;
        case "cardNumber should be of length between '8' and '19'.":
            return 'O número do cartão deve ter entre 8 e 19 dígitos.';
        case "securityCode should be of length '3' or '4'.":
            return 'O código de segurança deve ter 3 ou 4 dígitos.';
        case "cardNumber should be a number.":
            return 'O número do cartão não pode ser um texto.';
        case "invalid parameter identificationNumber":
            return 'Número de documento inválido.';
        case "Invalid card holder name.":
            return 'Nome do titular do cartão inválido.';
        case "Invalid expiration month.":
            return 'Mês de expiração inválido.';
        case "Invalid security code.":
            return 'Código de segurança inválido.';
        case "Invalid card number.":
            return 'Número do cartão inválido.';
        case "Invalid payer email.":
            return 'E-mail do pagador inválido.';
        case "Invalid payer identification type.":
            return 'Tipo de documento do pagador inválido.';
        case "Invalid payer identification number.":
            return 'Número de documento do pagador inválido.';
        case "Invalid transaction amount.":
            return 'Valor da transação inválido.';
        case "Invalid installments.":
            return 'Número de parcelas inválido.';
        case "Invalid payment method.":
            return 'Método de pagamento inválido.';
        case "Invalid issuer.":
            return 'Emissor do cartão inválido.';
        case "The card is not enabled for online purchases.":
            return 'O cartão não está habilitado para compras online.';
        case "Do not honor.":
            return 'Recusado pelo banco emissor. Contate seu banco.';
        case "Insufficient funds.":
            return 'Fundos insuficientes.';
        case "Payment method not available.":
            return 'Método de pagamento não disponível no momento.';
        case "Card not accepted.":
            return 'Cartão não aceito para esta transação.';
        case "Processing error.":
            return 'Ocorreu um erro no processamento. Tente novamente.';
        case "Maximum attempts exceeded.":
            return 'Número máximo de tentativas excedido.';
        case "Invalid parameters.":
            return 'Parâmetros inválidos. Verifique os dados e tente novamente.';
        case "Unauthorized payment.":
            return 'Pagamento não autorizado.';
        case "Fraudulent transaction.":
            return 'Transação considerada fraudulenta.';
        case "Expired card.":
            return 'Cartão expirado.';
        case "Card lost or stolen.":
            return 'Cartão perdido ou roubado.';
        case "Payment declined by provider.":
            return 'Pagamento recusado pelo provedor.';
        case "Invalid payment method type.":
            return 'Tipo de método de pagamento inválido.';
        case "Payment is pending.":
            return 'O pagamento está pendente.';
        case "Payment is rejected.":
            return 'O pagamento foi rejeitado.';
        case "Payment is refunded.":
            return 'O pagamento foi reembolsado.';
        case "Payment is cancelled.":
            return 'O pagamento foi cancelado.';
        case "Payment is in process.":
            return 'O pagamento está em processamento.';
        case "Payment requires authentication.":
            return 'O pagamento requer autenticação.';
        case "The card's security code is invalid.":
            return 'O código de segurança do cartão é inválido.';
        case "The card's expiration date is invalid.":
            return 'A data de validade do cartão é inválida.';
        case "The card's expiration month is invalid.":
            return 'O mês de validade do cartão é inválido.';
        case "The card's expiration year is invalid.":
            return 'O ano de validade do cartão é inválido.';
        case "The card's cardholder name is invalid.":
            return 'O nome do titular do cartão é inválido.';
        case "The card's cardholder identification type is invalid.":
            return 'O tipo de documento do titular do cartão é inválido.';
        case "The card's cardholder identification number is invalid.":
            return 'O número de documento do titular do cartão é inválido.';
        case "The provided token is invalid.":
            return 'O token fornecido é inválido.';
        case "Your payment has been declined.":
            return 'Seu pagamento foi recusado.';
        case "Payment not approved.":
            return 'Pagamento não aprovado.';
        case "There was an error processing your payment.":
            return 'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.';
        case "Internal error.":
            return 'Erro interno. Por favor, tente novamente mais tarde.';

        // Novas validações baseadas nas imagens fornecidas
        case "cardNumber is empty.":
            return "O número do cartão não pode ser vazio.";
        case "securityCode is empty.":
            return "O código de segurança não pode ser vazio.";
        case "expirationMonth should be a number.":
            return "O mês de expiração deve ser um número.";
        case "expirationMonth is empty.":
            return "O mês de expiração não pode ser vazio.";
        case "expirationYear should be a number.":
            return "O ano de expiração deve ser um número.";
        case "expirationYear is empty.":
            return "O ano de expiração não pode ser vazio.";
        case "securityCode should be a number.":
            return "O código de segurança deve ser um número.";
        case "securityCode should be of length '3'.":
            return "O código de segurança deve ter 3 dígitos.";
        case "cardNumber should be of length '16'.": // Adicionado com base na última imagem
            return "O número do cartão deve ter 16 dígitos.";

        // Caso a mensagem não seja reconhecida, retorna nulo.
        default:
            return null;
    }
};
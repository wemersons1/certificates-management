<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Código de Confirmação {{ env('APP_NAME') }}  </title>
</head>
<body style="font-family: 'Nunito', sans-serif; background-color: #f8faff; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; width: 100% !important;">
    <div style="background-color: #f8faff; padding: 30px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
                <td style="padding: 0; background-color: #2563eb; padding: 30px 20px; text-align: center;">
                    <div style="font-weight: 900; font-size: 24px; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Montserrat', sans-serif;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 28px; height: 28px; vertical-align: middle;">
                            <path d="M17 7a5 0 1 1-10 0 5 5 0 0 1 10 0ZM12 22v-5"></path>
                            <path stroke-linecap="round" d="M15.5 17.5 12 22l-3.5-4.5"></path>
                        </svg>
                        <?= env('APP_NAME')?>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center; font-size: 16px;">
                    <p style="font-size: 20px; font-weight: 700; color: #18306b; margin-top: 0; margin-bottom: 15px;">Confirme sua Conta</p>
                    <p style="margin-bottom: 15px;">Olá, {{ $user->name }}</p>
                    <p style="margin-bottom: 15px;">Você solicitou um código de confirmação para acessar sua conta <?= env('APP_NAME')?>. Use o código abaixo para prosseguir com a sua verificação:</p>
                    <div style="background-color: #eef3ff; color: #18306b; font-size: 36px; font-weight: 700; letter-spacing: 5px; padding: 20px 30px; border-radius: 8px; display: inline-block; margin: 25px auto;">
                        {{ $code }} </div>
                    <p style="margin-bottom: 15px;">Este código é válido por <strong style="font-weight: 700;">10 minutos</strong>. Por favor, não o compartilhe com ninguém.</p>
                    <p style="margin-bottom: 15px;">Se você não solicitou este código, por favor, ignore este e-mail.</p>
                    <p style="margin-bottom: 0;">Atenciosamente,<br>A Equipe {{ env('APP_NAME') }}</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; background-color: #1e3a8a; color: #dbeafe; padding: 30px 20px; text-align: center; font-size: 14px;">
                    <p style="margin-top: 0; margin-bottom: 10px;">© {{ date('Y') }} <?= env('APP_NAME')?>. Todos os direitos reservados.</p>
                    <p style="margin-bottom: 0;"><a href="{{ env('APP_URL') }}/politica-privacidade" target="_blank" style="text-decoration: underline; color: #dbeafe;">Política de Privacidade</a> | <a href="{{ env('APP_URL') }}/termos-de-uso" target="_blank" style="text-decoration: underline; color: #dbeafe;">Termos de Uso</a></p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
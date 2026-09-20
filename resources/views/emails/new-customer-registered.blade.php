<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Novo Cliente: {{ $user->name }}</title>
</head>
<body style="font-family: 'Nunito', sans-serif; background-color: #f8faff; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; width: 100% !important;">
    <div style="background-color: #f8faff; padding: 30px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
                <td style="padding: 0; background-color: #2ecc71; padding: 30px 20px; text-align: center;">
                    <div style="font-weight: 900; font-size: 24px; color: #ffffff; font-family: 'Montserrat', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        🚀 {{ config('app.name') }}
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center; font-size: 16px;">
                    <p style="font-size: 20px; font-weight: 700; color: #18306b; margin-top: 0; margin-bottom: 15px;">
                        🎉 Uhuuul! Temos um novo usuário!
                    </p>
                    
                    <p style="margin-bottom: 15px; color: #555;">
                        Fala, time! O sistema de certificação acaba de ganhar um novo membro:
                    </p>

                    <div style="background-color: #f0fff4; color: #27ae60; font-size: 28px; font-weight: 700; padding: 20px 30px; border-radius: 8px; display: inline-block; margin: 25px auto; border: 1px dashed #2ecc71;">
                        {{ $user->name }}
                    </div>

                    <p style="margin-bottom: 15px; color: #555;">
                        Isso significa que o projeto está crescendo e mais pessoas estão sendo alcançadas! Um novo certificado está pronto para fazer a diferença na carreira de alguém.
                    </p>

                    <p style="margin-top: 25px; font-weight: 700; color: #18306b; font-size: 18px;">
                        Bora pra cima! 🚀
                    </p>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; background-color: #1e3a8a; color: #dbeafe; padding: 30px 20px; text-align: center; font-size: 14px;">
                    <p style="margin-top: 0; margin-bottom: 10px;">© {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
                    <p style="margin-bottom: 0;">
                        <a href="{{ url('/') }}" target="_blank" style="text-decoration: underline; color: #dbeafe;">Painel Administrativo</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
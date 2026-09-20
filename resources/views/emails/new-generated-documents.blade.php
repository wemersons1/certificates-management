<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📑 Certificados Gerados por: {{ $user->name }}</title>
</head>
<body style="font-family: 'Nunito', sans-serif; background-color: #f8faff; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; width: 100% !important;">
    <div style="background-color: #f8faff; padding: 30px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
                <td style="padding: 0; background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
                    <div style="font-weight: 900; font-size: 24px; color: #ffffff; font-family: 'Montserrat', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        📄 {{ config('app.name') }}
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center; font-size: 16px;">
                    <p style="font-size: 20px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 15px;">
                        Novas emissões realizadas!
                    </p>
                    
                    <p style="margin-bottom: 15px; color: #555;">
                        O sistema registrou uma nova movimentação. Os certificados foram gerados pelo usuário:
                    </p>

                    <div style="background-color: #f1f5f9; color: #1e3a8a; font-size: 22px; font-weight: 700; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px auto; border: 1px solid #e2e8f0;">
                        {{ $user->name }}
                    </div>

                    <p style="margin-bottom: 15px; color: #555;">
                        Isso valida o impacto da plataforma!</strong>.
                    </p>

                    <p style="margin-top: 25px; font-weight: 700; color: #1e3a8a; font-size: 18px;">
                        O trabalho continua! 🚀
                    </p>
                </td>
            </tr>
            <tr>
                <td style="padding: 0; background-color: #f1f5f9; color: #64748b; padding: 30px 20px; text-align: center; font-size: 14px;">
                    <p style="margin-top: 0; margin-bottom: 10px;">© {{ date('Y') }} {{ config('app.name') }}. Relatório Interno.</p>
                    <p style="margin-bottom: 0;">
                        <a href="{{ url('/admin/dashboard') }}" target="_blank" style="text-decoration: none; color: #1e3a8a; font-weight: 700;">Acessar Painel de Controle</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
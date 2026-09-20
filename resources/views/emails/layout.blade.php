{{-- resources/views/emails/layout.blade.php --}}
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>
    <style>
        body {
            margin:0; padding:0;
            background-color: #f4f4f4;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .email-wrapper {
            width: 100%; background-color: #f4f4f4; padding: 20px 0;
        }
        .email-content {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background-color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .email-header img {
            max-height: 60px;
        }
        .email-body {
            padding: 20px;
            color: #333333;
            line-height: 1.6;
        }
        .email-footer {
            background-color: #fafafa;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777777;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 15px;
            text-decoration: none;
            background-color: #4CAF50;
            color: #ffffff;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <div class="email-header">
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('assets/images/logo-flash.png'))) }}" alt="Logo da Empresa">

            </div>
            <div class="email-body">
                @yield('body')
            </div>
            <div class="email-footer">
                © {{ date('Y') }} {!! $company_name !!}. Todos os direitos reservados.
            </div>
        </div>
    </div>
</body>
</html>

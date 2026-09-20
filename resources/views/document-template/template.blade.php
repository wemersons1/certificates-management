<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Certificado</title>

  <style>
    p:empty {
      margin: 0 !important;
      padding: 0 !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: {{ $width }}px;
      height: 100%!important;
      font-family: Arial, sans-serif;
      font-size: 14px;
      background-color: #fff;
      box-sizing: border-box;
      position: relative;
    }

    /* Regra para impressão */
    @page {
      size: A4 {{ $orientation }};
      margin: 0 !important;
      /* Movendo o background para a regra @page para que ele se repita */
      background-image: url('{{ $logo }}'), url('{{ $frame }}');
      background-repeat: no-repeat, no-repeat;
      background-position: top left, top left;
      background-size: {{$headerSize}}px auto, 100% auto;
    }

    /* Esta regra é para a visualização na tela. Para a impressão, as imagens são definidas no @page */
    body {
        background-image: url('{{ $logo }}'), url('{{ $frame }}');
        background-repeat: no-repeat, no-repeat;
        background-position: top left, top left;
        background-size: {{$headerSize}}px auto, 100% auto;
    }
    
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    .content {
      position: relative;
      z-index: 1;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #000;
      /* Condição para permitir quebra de página apenas em orientação portrait */
      @if ($orientation === 'landscape')
        overflow: hidden;
      @endif
      background-image: url('{{ $logo }}'), url('{{ $frame }}');
      background-repeat: no-repeat, no-repeat;
      background-position: top left, top left;
      background-size: {{$headerSize}}px auto, 100% auto;
    }

    h1, h2, h3, h4, h5, h6, p {
        margin: 0 !important;
        padding: 0 !important;
    }
  </style>
</head>
<body>

  <div class="content">
    {!! $template !!}
  </div>
</body>
</html>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <title>Certificado</title>
    <!-- Google Fonts for Pixel-Perfect Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Architects+Daughter&family=Bad+Script&family=Berkshire+Swash&family=Cinzel+Decorative&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Dancing+Script:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Inter:wght@300;400;500;600;700&family=Italianno&family=Kaushan+Script&family=La+Belle+Aurore&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Marck+Script&family=Montserrat+Alternates:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Mr+De+Haviland&family=Niconne&family=Oswald:wght@300;400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quintessential&family=Roboto:wght@300;400;500;700&family=Sacramento&family=Satisfy&family=Tangerine:wght@700&family=Yellowtail&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Baskervville&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Prata&family=DM+Serif+Display&family=Playfair+Display+SC:wght@400;700&family=Cormorant+Unicase:wght@400;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Rochester&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&family=Qwigley&family=WindSong&display=swap" rel="stylesheet">
    <style>
        :root {
            --page-width: {{ $width }};
            --page-height: {{ $height }};
        }

        @page {
            size: A4 {{ $orientation === 'landscape' ? 'landscape' : 'portrait' }};
            margin: 0;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #fff;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.2;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        .page {
            width: var(--page-width);
            height: var(--page-height);
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
            page-break-after: always;
            break-after: page;
        }

        .page.front {
            @if (empty($newVersion))
                @if (!empty($frame))
                    background-image: url('{{ $frame }}');
                    background-repeat: no-repeat;
                    background-position: {{ !empty($isTopOnlyFrame) ? 'top center' : 'center center' }};
                    background-size: {{ !empty($isTopOnlyFrame) ? '100% auto' : '100% 100%' }};
                @endif
            @endif
        }

        .page.back {
            @if (empty($newVersion))
                @php
                    $currentBackFrame = !empty($backFrame) ? $backFrame : $frame;
                    $isTopOnlyBack = $isTopOnlyBackFrame ?? $isTopOnlyFrame ?? false;
                @endphp
                @if (!empty($currentBackFrame))
                    background-image: url('{{ $currentBackFrame }}');
                    background-repeat: no-repeat;
                    background-position: {{ !empty($isTopOnlyBack) ? 'top center' : 'center center' }};
                    background-size: {{ !empty($isTopOnlyBack) ? '100% auto' : '100% 100%' }};
                @endif
            @endif
        }

        .page:last-child {
            page-break-after: auto;
            break-after: auto;
        }

        .page-content {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
            margin: 0;
            padding: 0;
        }

        /* Headings: margin e line-height zerados, tamanhos explícitos */
        h1, h2, h3, h4, h5, h6 {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.2;
        }

        h1 { font-size: 55px; }
        h2 { font-size: 45px; }
        h3 { font-size: 35px; }
        h4 { font-size: 30px; }
        h5 { font-size: 25px; }
        h6 { font-size: 20px; }

        /*
         * Parágrafos: espelha exatamente o applyStyle() do editor Course/index.tsx.
         * font-size: 19px, line-height: 1.2, centralizado — igual ao editor.
         */
        p {
            max-width: 90%;
            margin: 0 auto;
            padding: 0;
            font-size: 19px;
            line-height: 1.2;
            color: #34495e;
            text-align: center;
        }

        /* Preserva a altura visual de linhas vazias (1.2em × 19px = 22.8px). */
        p:empty {
            min-height: 1.2em;
        }

        p:empty::before {
            content: '\00a0';
        }

        /*
         * Parágrafos gerados pelo pdftohtml já possuem estilos inline precisos
         * (position:absolute, top, left, font-size, font-family).
         * Restaura todos os valores para os originais inline.
         */
        div[id^="page"][id$="-div"] p {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: inherit;
            line-height: inherit;
            color: inherit;
            text-align: inherit;
        }

        @media print {
            .page {
                margin: 0 !important;
                width: {{ $orientation === 'landscape' ? '297mm' : '210mm' }} !important;
                height: {{ $orientation === 'landscape' ? '210mm' : '297mm' }} !important;
                max-width: {{ $orientation === 'landscape' ? '297mm' : '210mm' }} !important;
                max-height: {{ $orientation === 'landscape' ? '210mm' : '297mm' }} !important;
                page-break-after: always !important;
                break-after: page !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }

            .cert-container {
                box-shadow: none !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
            }

            .content-side {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                position: relative !important;
            }
        }

        /* Responsive Scaling and Safety Containment overrides */
        .cert-container {
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
        }

        .content-side {
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
            position: relative !important;
        }

        /* V4-specific adjustments for new rendering engine */
        @if (!empty($newVersion))
            .page.v4-page {
                background: none !important;
                box-shadow: none !important;
            }
            .page.v4-page .cert-container {
                box-shadow: none !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }
            .page.v4-page .content-side {
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }
        @endif
    </style>
</head>
<body>
    @foreach (($pages ?? []) as $page)
        <div class="page {{ !empty($newVersion) ? 'v4-page' : '' }} {{ !empty($page['is_back_page']) ? 'back' : 'front' }}" data-page-type="{{ !empty($page['is_back_page']) ? 'back' : 'front' }}">
            <div class="page-content">
                {!! $page['template'] !!}
            </div>
        </div>
    @endforeach
</body>
</html>
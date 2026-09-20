<?php

namespace App\Services\Image;
class ConvertToPngService
{
    public function execute($base64Image)
    {
        // Extrair base64
        if (strpos($base64Image, ',') !== false) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
        }

        $base64Image = str_replace(' ', '+', $base64Image);
        $imageData = base64_decode($base64Image);

        // Salvar temporário
        $tmpFile = sys_get_temp_dir() . '/' . uniqid() . '.png';
        file_put_contents($tmpFile, $imageData);

        try {
            $imagick = new \Imagick($tmpFile);
            $imagick->setImageFormat('png');
            $imagick->setImageAlphaChannel(\Imagick::ALPHACHANNEL_SET);

            // Definir tolerância (fuzz)
            $imagick->setOption('fuzz', '15%'); // Ajuste conforme necessário

            $width = $imagick->getImageWidth();
            $height = $imagick->getImageHeight();

            // 🔹 1. Remover fundo externo (pixel do canto superior esquerdo)
            $backgroundExternal = $imagick->getImagePixelColor(1, 1);
            $imagick->floodFillPaintImage(
                'transparent',
                0,
                $backgroundExternal,
                1,
                1,
                false
            );

            // 🔹 2. Remover fundo interno (pixel do centro da imagem)
            $backgroundInternal = $imagick->getImagePixelColor((int)($width / 2), (int)($height / 2));
            $imagick->floodFillPaintImage(
                'transparent',
                0,
                $backgroundInternal,
                (int)($width / 2),
                (int)($height / 2),
                false
            );

            // 🔥 Limpeza adicional de resíduos brancos
            $imagick->transparentPaintImage('#FFFFFF', 0, 0.15, false);

            // 🔧 Opcional: cortar espaço excedente
            $imagick->trimImage(0);

            // 🔧 Opcional: adicionar borda transparente de 20px para não cortar muito rente
            $imagick->borderImage('transparent', 20, 20);

            // Converter para base64
            $result = 'data:image/png;base64,' . base64_encode($imagick->getImagesBlob());

            // Limpeza
            $imagick->clear();
            $imagick->destroy();
            unlink($tmpFile);

            return $result;
        } catch (\Exception $e) {
            if (file_exists($tmpFile)) {
                unlink($tmpFile);
            }
            throw $e;
        }
    }
}
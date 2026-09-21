<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use App\Services\Files\R2Path;

class ImageController extends Controller
{
    public function getImage(Request $request)
    {
        $input = $request->image;

        // 1. Extraímos apenas o caminho relativo da URL
        // Se vier "https://bucket.s3.region.amazonaws.com/frames/logo.webp"
        // parse_url retornará "/frames/logo.webp"
        // O disk já aplica o diretório raiz; remova prefixos que vieram na URL ou no banco.
        $path = R2Path::normalize($input);

        if (Storage::disk('s3')->exists($path)) {
            $file = Storage::disk('s3')->get($path);
            $type = Storage::disk('s3')->mimeType($path);

            return Response::make($file, 200, [
                'Content-Type' => $type,
                'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
                'Cache-Control' => 'max-age=86400, public',
            ]);
        }

        abort(404, 'Imagem não encontrada no S3 no caminho: ' . $path);
    }
}

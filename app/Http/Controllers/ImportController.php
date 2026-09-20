<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class ImportController extends Controller
{
    public function import($id)
    {
        return response()->stream(function () use ($id) {
            $start = time();
            while (true) {
                $progress = Cache::get("import-progress:$id", 0);
                $errors = Cache::get("import-errors:$id", 0);
                Cache::forget('import-errors:' . $id);

                echo "event: progress\n";
                echo 'data: ' . json_encode(['progress' => $progress, 'detailsError' => $errors]) . "\n\n";
        
                ob_flush();
                flush();
        
                if ($progress >= 100 || ((time() - $start) > 900)) {
                    echo "event: progress\n";
                    echo 'data: ' . json_encode(['progress' => 100, 'detailsError' => $errors]) . "\n\n";
            
                    break; // termina a conexão após 30 segundos
                }
        
                sleep(1);
                }
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
            ]);
    }
}

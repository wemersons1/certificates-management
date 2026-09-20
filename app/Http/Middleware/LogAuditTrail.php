<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAuditTrail
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $response = $next($request);
        $executionTime = (microtime(true) - $startTime) * 1000; // Convert to ms

        // Only log API routes and authenticated requests
        if ($request->is('api/*') && auth('sanctum')->check()) {
            $this->logRequest($request, $response, $executionTime);
        }

        return $response;
    }

    private function logRequest(Request $request, Response $response, float $executionTime): void
    {
        try {
            $user = auth('sanctum')->user();

            if ($this->shouldSkipUser($user)) {
                return;
            }
            
            // Skip logging for certain routes
            $skipRoutes = ['notification-send', 'dashboard'];
            foreach ($skipRoutes as $skipRoute) {
                if ($request->is("api/$skipRoute*")) {
                    return;
                }
            }

            AuditLog::create([
                'user_id' => $user?->id,
                'method' => $request->getMethod(),
                'route' => $request->path(),
                'url' => $request->fullUrl(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                // Use somente input textual para evitar erro com arquivos temporarios ja movidos.
                'request_data' => $this->sanitizeData($request->input()),
                'response_status' => $response->getStatusCode(),
                'execution_time' => $executionTime,
            ]);
        } catch (\Exception $e) {
            // Silently fail to avoid impacting the application
            report($e);
        }
    }

    private function shouldSkipUser($user): bool
    {
        if (!$user) {
            return false;
        }

        if (method_exists($user, 'isMaster') && $user->isMaster()) {
            return true;
        }

        $roleName = strtolower((string) ($user?->role?->name ?? ''));

        return in_array($roleName, ['master', 'root'], true);
    }

    private function sanitizeData(array $data): array
    {
        $sensitive = ['password', 'password_confirmation', 'token', 'secret', 'api_key'];
        
        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitive)) {
                $data[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitizeData($value);
            }
        }
        
        return $data;
    }
}

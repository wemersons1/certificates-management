<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->select(['id', 'user_id', 'method', 'route', 'url', 'ip_address', 'user_agent', 'response_status', 'execution_time', 'created_at'])
            ->when($request->filled('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })
            ->when($request->filled('method'), function ($q) use ($request) {
                $q->where('method', $request->method);
            })
            ->when($request->filled('route'), function ($q) use ($request) {
                $q->where('route', 'like', '%' . $request->route . '%');
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('response_status', $request->status);
            })
            ->when($request->filled('ip'), function ($q) use ($request) {
                $q->where('ip_address', $request->ip);
            })
            ->when($request->filled('user_email'), function ($q) use ($request) {
                $q->whereHas('user', function ($q2) use ($request) {
                    $q2->where('email', 'like', '%' . $request->user_email . '%');
                });
            })
            ->orderBy('id', 'desc');

        return $query->paginate(50);
    }
}

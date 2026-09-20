<?php

namespace App\Http\Controllers;

use App\Models\NotificationSend;
use Illuminate\Http\Request;


class NotificationSendController extends Controller
{
    public function index(Request $request)
    {
        $query = NotificationSend::myScope()
            ->select(['id', 'title', 'type', 'employee_id', 'company_id', 'entity_id', 'contact', 'presence_list_id', 'created_at'])
            ->with(['employee', 'company', 'presence_list.course', 'entity'])
            ->when($request->filled('name'), function ($q) use ($request) {
                $q->whereHas('employee', function ($q2) use ($request) {
                    $q2->where('name', 'like', '%' . $request->name . '%');
                })->orWhereHas('company', function ($q2) use ($request) {
                    $q2->where('name', 'like', '%' . $request->name . '%');
                });
            })
            ->when($request->filled('email'), function ($q) use ($request) {
                $q->whereHas('employee', function ($q2) use ($request) {
                    $q2->where('email', 'like', '%' . $request->email . '%');
                })->orWhereHas('company', function ($q2) use ($request) {
                    $q2->where('email', 'like', '%' . $request->email . '%');
                });
            })
            ->when($request->filled('cnpj'), function ($q) use ($request) {
                $q->whereHas('company', function ($q2) use ($request) {
                    $q2->where('cnpj', 'like', '%' . $request->cnpj . '%');
                });
            })
            ->when($request->filled('type'), function ($q) use ($request) {
                $q->where('type', $request->type);
            });

        return $query->paginate();
    }

}

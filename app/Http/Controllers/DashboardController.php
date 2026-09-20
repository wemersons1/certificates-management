<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\Report;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function report(Request $request)
    {
        $report = new Report();
        $period = $request->input('period', 7);
        $data = $report->execute($period);

        return response()->json($data);
    }
} 
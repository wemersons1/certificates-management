<?php

namespace App\Http\Controllers;

use App\Models\BusinessSegment;
use Illuminate\Http\Request;

class BusinessSegmentController extends Controller
{
    /**
     * Return all business segments
     */
    public function index(Request $request)
    {
        return BusinessSegment::get();
    }
}

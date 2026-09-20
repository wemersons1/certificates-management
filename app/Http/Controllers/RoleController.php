<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userLogged = Auth::user();
        return Role::where('id', '>=', $userLogged->role_id)->get();
    }
}

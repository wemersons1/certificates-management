<?php

namespace App\Http\Controllers;

use App\Models\Entity;
use App\Models\User;
use Illuminate\Http\Request;

class EntitiesAvailableForEmail extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'email' => 'string|max:200'
        ]);

        if ($request->email) {
            return User::with('entity.config')->where('email', $request->email)->get();
        }
    }
}

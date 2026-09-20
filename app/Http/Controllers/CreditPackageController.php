<?php

namespace App\Http\Controllers;

use App\Models\CreditPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = CreditPackage::query();
        
        if (!Auth::user()->isMaster()) {
            $query->where('active', true);
        }

        if ($request->has('all')) {
            return $query->orderBy('credits', 'asc')->get();
        }

        return $query->orderBy('credits', 'asc')->paginate(15);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isMaster()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credits' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'validity_days' => ['required', 'integer', 'min:1'],
            'active' => ['boolean']
        ]);

        $package = CreditPackage::create($validated);

        return response()->json($package, 201);
    }

    public function show($id)
    {
        $package = CreditPackage::findOrFail($id);
        return response()->json($package);
    }

    public function update(Request $request, $id)
    {
        if (!Auth::user()->isMaster()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $package = CreditPackage::findOrFail($id);

        $validated = $request->validate([
            'name' => ['string', 'max:255'],
            'credits' => ['integer', 'min:1'],
            'price' => ['numeric', 'min:0'],
            'validity_days' => ['integer', 'min:1'],
            'active' => ['boolean']
        ]);

        $package->update($validated);

        return response()->json($package);
    }

    public function destroy($id)
    {
        if (!Auth::user()->isMaster()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $package = CreditPackage::findOrFail($id);
        $package->delete();

        return response()->noContent();
    }
}

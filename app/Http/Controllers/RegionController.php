<?php

namespace App\Http\Controllers;

use App\Http\Requests\Region\IndexCityRequest;
use App\Models\City;
use App\Models\State;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function states()
    {
        return State::all();
    }

    public function cities(IndexCityRequest $request)
    {
        $validated = $request->validated();

        $cities = City::myScope($validated);

        if (isset($validated['state_id'])) {
            $cities->whereIn('estado_id', $validated['state_id']);
        }

        return $cities->get();
    }
}

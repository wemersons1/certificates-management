<?php

namespace App\Services\Checkout;

use App\Helpers\AppHelper;
use App\Models\EntityContract;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Services\MercadoPago\MercadoPagoService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FreePlanService
{
    public function __construct()
    {
    }

    public function execute($data)
    {
        $userLogged = Auth::user();

        $plan = Plan::find($data['plan_id']);
        $planVersion = $plan->latestVersion;

        $order = Order::create([
            'user_id' => $userLogged->id,
            'plan_version_id' => $planVersion?->id,
            'value' => 0,
            'periodicity' => 'monthly',
            'status' => 'completed'
        ]);

        return $order;
    }
}


<?php

namespace App\Http\Controllers;

use App\Http\Requests\Checkout\ChargeCreditCardRequest;
use App\Http\Requests\Checkout\FreePlanRequest;
use App\Http\Requests\Checkout\GenerateQrcodeRequest;
use App\Http\Requests\Checkout\RegisterSubscriptionRequest;
use App\Models\Order;
use App\Services\Checkout\ChargeCreditCardService;
use App\Services\Checkout\FreePlanService;
use App\Services\Checkout\GenerateQrcodeService;
use App\Services\Checkout\RegisterSubscriptionService;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    public function generateQrcode(GenerateQrcodeRequest $request)
    {
        $generateQrcodeService = new GenerateQrcodeService();
        
        return $generateQrcodeService->execute($request->validated());
    }

    public function chargeCreditCard(ChargeCreditCardRequest $request)
    {
        $chargeCreditCardService = new ChargeCreditCardService();

        return $chargeCreditCardService->execute($request->validated());
    }

    public function paymentDetails(\Illuminate\Http\Request $request)
    {
        $userLogged = Auth::user();
        $type = $request->query('type');

        if ($type === 'credits') {
            $latestOrder = \App\Models\CreditPackageOrder::with(['creditPackage'])
                ->where('user_id', $userLogged->id)
                ->orderBy('created_at', 'DESC')
                ->first();
        } elseif ($type === 'plan') {
            $latestOrder = Order::with(['contract', 'planVersion'])
                ->where('user_id', $userLogged->id)
                ->orderBy('created_at', 'DESC')
                ->first();
        } else {
            $order = Order::with(['contract', 'planVersion'])
                ->where('user_id', $userLogged->id)
                ->orderBy('created_at', 'DESC')
                ->first();

            $creditOrder = \App\Models\CreditPackageOrder::with(['creditPackage'])
                ->where('user_id', $userLogged->id)
                ->orderBy('created_at', 'DESC')
                ->first();

            if ($order && $creditOrder) {
                $latestOrder = $order->created_at > $creditOrder->created_at ? $order : $creditOrder;
            } else {
                $latestOrder = $order ?? $creditOrder;
            }
        }

        if ($latestOrder instanceof Order) {
            $latestOrder->setAppends(['last_order_payment']);
            return $latestOrder;
        } elseif ($latestOrder instanceof \App\Models\CreditPackageOrder) {
            // Mock the structure expected by the frontend
            $latestOrderArray = $latestOrder->toArray();
            $latestOrderArray['last_order_payment'] = [
                'payment_status' => $latestOrder->payment_status,
                'payment_form'   => $latestOrder->payment_form
            ];
            return $latestOrderArray;
        }

        return response()->noContent();
    }

    public function freePlan(FreePlanRequest $request)
    {
        $validated = $request->validated();
        
        $freePlanService = new FreePlanService();

        return $freePlanService->execute($validated);
    }

    public function registerSubscription(RegisterSubscriptionRequest $request)
    {
        $registerSubscriptionService = new RegisterSubscriptionService();

        return $registerSubscriptionService->execute($request->validated());
    }
}

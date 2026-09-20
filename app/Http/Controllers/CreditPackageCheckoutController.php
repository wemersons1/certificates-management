<?php

namespace App\Http\Controllers;

use App\Models\CreditPackage;
use App\Models\CreditPackageOrder;
use App\Services\Checkout\CreditPackageCardService;
use App\Services\Checkout\CreditPackagePixService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditPackageCheckoutController extends Controller
{
    /**
     * List active credit packages available for purchase.
     */
    public function packages(): JsonResponse
    {
        $packages = CreditPackage::where('active', true)
            ->orderBy('credits', 'asc')
            ->get();

        return response()->json($packages);
    }

    /**
     * Generate a PIX QR code for purchasing a credit package.
     */
    public function generatePixQrcode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credit_package_id' => 'required|integer|exists:credit_packages,id',
        ]);

        $service = new CreditPackagePixService();
        $order = $service->execute($validated);

        return response()->json([
            'order_id'               => $order->id,
            'status'                 => $order->status,
            'mercadopago_pix_qrcode' => $order->mercadopago_pix_qrcode,
            'mercadopago_copy_and_past' => $order->mercadopago_copy_and_past,
            'mercadopago_ticket_url' => $order->mercadopago_ticket_url,
            'credits_granted'        => $order->credits_granted,
        ]);
    }

    /**
     * Charge credit card for a credit package purchase.
     */
    public function chargeCreditCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credit_package_id'        => 'required|integer|exists:credit_packages,id',
            'token'                    => 'required|string',
            'payment_method_id'        => 'required|string',
            'issuer_id'                => 'nullable|string',
            'installments'             => 'required|integer|min:1',
            'payer_identification_type'=> 'required|string',
            'payer_identification_number' => 'required|string',
        ]);

        $service = new CreditPackageCardService();
        $order = $service->execute($validated);

        return response()->json([
            'order_id'        => $order->id,
            'status'          => $order->status,
            'payment_status'  => $order->payment_status,
            'credits_granted' => $order->credits_granted,
            'status_detail'   => $order->mercadopago_status_detail,
        ]);
    }

    /**
     * Poll the status of a credit package order (for PIX confirmation).
     */
    public function pollOrderStatus(int $orderId): JsonResponse
    {
        $user = Auth::user();

        $order = CreditPackageOrder::where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'order_id'        => $order->id,
            'status'          => $order->status,
            'payment_status'  => $order->payment_status,
            'credits_granted' => $order->credits_granted,
        ]);
    }
}

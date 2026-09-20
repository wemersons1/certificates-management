<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\CreditPackageOrder;
use App\Models\CreditPackage;
use App\Models\CreditBatch;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Http\Request;
use MercadoPago\MercadoPagoConfig;

class SynchronizeStatusSubscriptionController extends Controller
{
     public function __construct() {
        $access_token = env('MERCADO_PAGO_ACCESS_TOKEN');
        MercadoPagoConfig::setAccessToken($access_token);
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
         if(isset($request->data['id'])) {
            $mercadopagoService = new MercadoPagoService();
            $paymentMercadopago = $mercadopagoService->getPayment($request->data['id']);

            if (!$paymentMercadopago) {
                return response()->json([
                    "message" => "Payment details not found"
                ], 404);
            }

            // Check if it is a subscription order payment already registered in order_payments
            $orderPayment = OrderPayment::where('mercadopago_operation_id', $request->data['id'])->first();
            if ($orderPayment) {
                $this->updateOrderPayment($orderPayment, $paymentMercadopago);
                return response()->json([
                    "message" => "Received with success"
                ]);
            }

            // Check if it is a credit package order
            $creditOrder = CreditPackageOrder::where('mercadopago_operation_id', $request->data['id'])->first();
            if ($creditOrder) {
                $this->updateCreditOrder($creditOrder, $paymentMercadopago);
                return response()->json([
                    "message" => "Received with success"
                ]);
            }

            if (! isset($paymentMercadopago['metadata']['preapproval_id'])) {
                return response()->json([
                    "message" => "Received with success"
                ]);
            }

            $mercadopagoPreapprovalId = $paymentMercadopago['metadata']['preapproval_id'];

            $order = Order::where('mercadopago_preapproval_id', $mercadopagoPreapprovalId)
            ->orderBy('id', 'DESC')
            ->first();

            if (!$order) {
                  return response()->json([
                    "message" => "Received with success"
                ]);
            }
            
            if ($order->status != 'completed' && $paymentMercadopago['status'] === 'approved') {
                $order->status = 'completed';
                $order->save();
            }

            $deniedsStatuses = [
                'rejected',
                'cancelled',
                'refunded',
                'chargedback',
            ];

            if (in_array($paymentMercadopago['status'], $deniedsStatuses) && $order->status !== 'approved') {
                $order->status = 'cancelled';
                $order->save();
            }

            $dateApproved = $paymentMercadopago['date_approved'] ? new \DateTime($paymentMercadopago['date_approved']) : null;
            $moneyReleaseDate = $paymentMercadopago['money_release_date'] ? new \DateTime($paymentMercadopago['money_release_date']) : null;
            $dateCreated = $paymentMercadopago['date_created'] ? new \DateTime($paymentMercadopago['date_created']) : null;

            OrderPayment::updateOrCreate([
                'mercadopago_operation_id' => $request->data['id'],
                'order_id' => $order->id,
            ], [
                    'mercadopago_operation_type' =>  $paymentMercadopago['operation_type'],
                    'payment_status' =>  $paymentMercadopago['status'],
                    'mercadopago_status_detail' => $paymentMercadopago['status_detail'],
                    'mercadopago_date_created' => $dateCreated?->format('Y-m-d H:i:s') ?? null,
                    'mercadopago_date_approved' => $dateApproved?->format('Y-m-d H:i:s') ?? null,
                    'mercadopago_money_release_date' => $moneyReleaseDate?->format('Y-m-d H:i:s') ?? null,
                    'value' => (float) $paymentMercadopago['transaction_details']['total_paid_amount'] * 100,
                    'payment_form' => 'credit_card_recurrence',
                    'reference' => date('m/Y'),
                    'mercadopago_payment_method_id' =>  $paymentMercadopago['payment_method']['id'],
            ]);
        }

        return response()->json([
            "message" => "Received with success"
        ]);
    }

    private function updateOrderPayment(OrderPayment $orderPayment, array $paymentMercadopago)
    {
        $dateApproved = isset($paymentMercadopago['date_approved']) && $paymentMercadopago['date_approved'] 
            ? new \DateTime($paymentMercadopago['date_approved']) 
            : null;
        $moneyReleaseDate = isset($paymentMercadopago['money_release_date']) && $paymentMercadopago['money_release_date'] 
            ? new \DateTime($paymentMercadopago['money_release_date']) 
            : null;

        $orderPayment->update([
            'payment_status' =>  $paymentMercadopago['status'],
            'mercadopago_status_detail' =>  $paymentMercadopago['status_detail'],
            'mercadopago_date_approved' =>  $dateApproved ? $dateApproved->format('Y-m-d H:i:s') : null,
            'mercadopago_money_release_date' =>  $moneyReleaseDate ? $moneyReleaseDate->format('Y-m-d H:i:s') : null,
            'mercadopago_total_paid_amount' => $paymentMercadopago['transaction_details']['total_paid_amount'] ?? null,
        ]);
        
        $order = $orderPayment->order;
        if ($order) {
            if ($order->status !== 'completed' && $paymentMercadopago['status'] === 'approved') {
                $order->status = 'completed';
                $order->save();
            }

            $deniedsStatuses = [
                'rejected',
                'cancelled',
                'refunded',
                'chargedback',
            ];

            if (in_array($paymentMercadopago['status'], $deniedsStatuses) && $order->status !== 'approved') {
                $order->status = 'cancelled';
                $order->save();
            }
        }
    }

    private function updateCreditOrder(CreditPackageOrder $creditOrder, array $paymentMercadopago)
    {
        $dateApproved = isset($paymentMercadopago['date_approved']) && $paymentMercadopago['date_approved'] 
            ? new \DateTime($paymentMercadopago['date_approved']) 
            : null;

        $isApproved = $paymentMercadopago['status'] === 'approved';

        $creditOrder->update([
            'payment_status' =>  $paymentMercadopago['status'],
            'mercadopago_status_detail' =>  $paymentMercadopago['status_detail'],
            'mercadopago_date_approved' =>  $dateApproved ? $dateApproved->format('Y-m-d H:i:s') : null,
            'status' => $isApproved ? 'approved' : $creditOrder->status,
        ]);

        if ($isApproved && !$creditOrder->credits_granted) {
            $package = CreditPackage::find($creditOrder->credit_package_id);
            if ($package) {
                CreditBatch::create([
                    'user_id'       => $creditOrder->user_id,
                    'type'          => 'addon',
                    'total_credits' => $package->credits,
                    'used_credits'  => 0,
                    'start_date'    => now(),
                    'expires_at'    => now()->addDays($package->validity_days),
                ]);
                $creditOrder->update(['credits_granted' => true]);
            }
        }
    }
}

<?php

namespace App\Services\Checkout;

use App\Helpers\AppHelper;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\PlanVersion;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GenerateQrcodeService
{
    public function __construct()
    {
    }

    public function execute($data)
    {
        $userLogged = Auth::user();

        return DB::transaction(function ()use ($data, $userLogged) {
            $data['user_id'] = $userLogged->id;
            $planVersion = PlanVersion::findOrFail($data['plan_version_id']);
            $nameColumnValue = "{$data['periodicity']}_value";
            $value = $planVersion->$nameColumnValue;
    
            $order = Order::create([
                ...$data,
                'payment_form' => 'pix',
                'status' => 'pending',
                'value' => $value,
            ]);  

            $orderPayment = OrderPayment::where('order_id', $order->id)->where('value', $value)
            ->where('payment_form', 'pix')->first();
            $now = date('Y-m-d H:i:s');

            if ($orderPayment && $orderPayment->mercadopago_date_of_expiration && $orderPayment->mercadopago_date_of_expiration > $now) {
                return $orderPayment;
            }
            $orderPayment = OrderPayment::create([
                'order_id' => $order->id,
                'value' => $value,
                'payment_form' => 'pix',
                'reference' => date('m/Y'),
                'due_date' => date('Y-m-d')
            ]);

            $mercadopagoService = new MercadoPagoService();
            $qrcodePix = $mercadopagoService->generateQrcode([
                ...$data,
                'id' => $orderPayment->id,
                'value' => AppHelper::formatCentsToFloat($orderPayment->value),
                'plan_name' => $planVersion->name,
                'periodicity' => $data['periodicity'],
                'reference' => $orderPayment->reference,
                'email' => $userLogged->email
            ]);
        
            $date_of_expiration = $qrcodePix->date_of_expiration ? new \DateTime($qrcodePix->date_of_expiration) : null;
            $date_created = $qrcodePix->date_created ? new \DateTime($qrcodePix->date_created) : null;
            $date_approved = $qrcodePix->date_approved ? new \DateTime($qrcodePix->date_approved) : null;
            $money_release_date = $qrcodePix->money_release_date ? new \DateTime($qrcodePix->money_release_date) : null;
            
            $orderPayment->update([
                'mercadopago_operation_id' =>  $qrcodePix->id,
                'mercadopago_operation_type' =>  $qrcodePix->operation_type,
                'payment_status' =>  $qrcodePix->status,
                'mercadopago_date_of_expiration' => $date_of_expiration ? $date_of_expiration->format('Y-m-d H:i:s') : null,
                'mercadopago_date_created' =>  $date_created ? $date_created->format('Y-m-d H:i:s') : null,
                'mercadopago_date_approved' =>  $date_approved ? $date_approved->format('Y-m-d H:i:s') : null,
                'mercadopago_status_detail' =>  $qrcodePix->status_detail,
                'mercadopago_money_release_date' =>  $money_release_date ? $money_release_date->format('Y-m-d H:i:s') : null,
                'mercadopago_payment_method_id' =>  $qrcodePix->payment_method->id,
                'mercadopago_installments' =>  $qrcodePix->installments,
                'mercadopago_pix_qrcode' =>  $qrcodePix->point_of_interaction->transaction_data->qr_code_base64,
                'mercadopago_ticket_url' =>  $qrcodePix->point_of_interaction->transaction_data->ticket_url,
                'mercadopago_copy_and_past' =>   $qrcodePix->point_of_interaction->transaction_data->qr_code,
                'mercadopago_total_paid_amount' => $qrcodePix->transaction_details->total_paid_amount,
                'mercadopago_payment_type_id' => $qrcodePix->payment_type_id
            ]);

            return $orderPayment;
        });
    }
}
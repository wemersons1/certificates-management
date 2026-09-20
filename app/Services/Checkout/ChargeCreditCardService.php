<?php

namespace App\Services\Checkout;

use App\Helpers\AppHelper;
use App\Helpers\HelperString;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\PlanVersion;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChargeCreditCardService
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
                'periodicity' => $data['periodicity'],
                'plan_version_id' => $data['plan_version_id'],
                'status' => 'pending',
                'value' => $value,
                'payment_form' => 'credit_card',
                'user_id' => $data['user_id']
            ]);  

            $orderPayment = OrderPayment::where('order_id', $order->id)
            ->where('value', $value)
            ->where('payment_form', 'pix')->first();
            $now = date('Y-m-d H:i:s');

            if ($orderPayment && $orderPayment->mercadopago_date_of_expiration && $orderPayment->mercadopago_date_of_expiration > $now) {
                return $orderPayment;
            }
            $orderPayment = OrderPayment::create([
                'order_id' => $order->id,
                'value' => $value,
                'payment_form' => 'credit_card',
                'reference' => date('m/Y'),
                'due_date' => date('Y-m-d'),
            ]);

            $mercadopagoService = new MercadoPagoService();
            $chargeCreditCard = $mercadopagoService->chargeCreditCard([
                ...$data,
                ...HelperString::getFirstAndLastName($userLogged->name),
                'id' => $orderPayment->id,
                'value' => AppHelper::formatCentsToFloat($orderPayment->value),
                'plan_name' => $planVersion->name,
                'periodicity' => 'annual',
                'reference' => $orderPayment->reference,
                'email' => $userLogged->email,
                'phone' => HelperString::extractPhoneDetails($userLogged->phone)
            ]);
        
            $date_of_expiration = $chargeCreditCard->date_of_expiration ? new \DateTime($chargeCreditCard->date_of_expiration) : null;
            $date_created = $chargeCreditCard->date_created ? new \DateTime($chargeCreditCard->date_created) : null;
            $date_approved = $chargeCreditCard->date_approved ? new \DateTime($chargeCreditCard->date_approved) : null;
            $money_release_date = $chargeCreditCard->money_release_date ? new \DateTime($chargeCreditCard->money_release_date) : null;

            $orderPayment->update([
                'mercadopago_operation_id' =>  $chargeCreditCard->id,
                'mercadopago_operation_type' =>  $chargeCreditCard->operation_type,
                'payment_status' =>  $chargeCreditCard->status,
                'mercadopago_date_of_expiration' => $date_of_expiration ? $date_of_expiration->format('Y-m-d H:i:s') : null,
                'mercadopago_date_created' =>  $date_created ? $date_created->format('Y-m-d H:i:s') : null,
                'mercadopago_date_approved' =>  $date_approved ? $date_approved->format('Y-m-d H:i:s') : null,
                'mercadopago_status_detail' =>  $chargeCreditCard->status_detail,
                'mercadopago_money_release_date' =>  $money_release_date ? $money_release_date->format('Y-m-d H:i:s') : null,
                'mercadopago_payment_method_id' =>  $chargeCreditCard->payment_method->id,
                'mercadopago_installments' =>  $chargeCreditCard->installments,
                'mercadopago_total_paid_amount' => $chargeCreditCard->transaction_details->total_paid_amount,
                'mercadopago_payment_type_id' => $chargeCreditCard->payment_type_id
            ]);

            return $orderPayment;
        });
    }
}


<?php

namespace App\Services\Checkout;

use App\Helpers\HelperString;
use App\Models\CreditBatch;
use App\Models\CreditPackage;
use App\Models\CreditPackageOrder;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreditPackageCardService
{
    public function execute(array $data): CreditPackageOrder
    {
        $user = Auth::user();

        return DB::transaction(function () use ($data, $user) {
            $package = CreditPackage::where('id', $data['credit_package_id'])
                ->where('active', true)
                ->firstOrFail();

            $order = CreditPackageOrder::create([
                'user_id'           => $user->id,
                'credit_package_id' => $package->id,
                'value'             => $package->price,
                'payment_form'      => 'credit_card',
                'status'            => 'pending',
            ]);

            $mercadopagoService = new MercadoPagoService();
            $chargeResult = $mercadopagoService->chargeCreditCard([
                ...$data,
                ...HelperString::getFirstAndLastName($user->name),
                'id'          => 'cp_' . $order->id,
                'value'       => $package->price,
                'plan_name'   => $package->name,
                'periodicity' => 'avulso',
                'reference'   => date('m/Y'),
                'email'       => $user->email,
                'phone'       => HelperString::extractPhoneDetails($user->phone),
            ]);

            $date_of_expiration = $chargeResult->date_of_expiration ? new \DateTime($chargeResult->date_of_expiration) : null;
            $date_created       = $chargeResult->date_created        ? new \DateTime($chargeResult->date_created)       : null;
            $date_approved      = $chargeResult->date_approved       ? new \DateTime($chargeResult->date_approved)      : null;

            $isApproved = $chargeResult->status === 'approved';

            $order->update([
                'mercadopago_operation_id'      => $chargeResult->id,
                'mercadopago_operation_type'    => $chargeResult->operation_type,
                'payment_status'                => $chargeResult->status,
                'mercadopago_status_detail'     => $chargeResult->status_detail,
                'mercadopago_date_created'      => $date_created      ? $date_created->format('Y-m-d H:i:s')      : null,
                'mercadopago_date_approved'     => $date_approved     ? $date_approved->format('Y-m-d H:i:s')     : null,
                'mercadopago_date_of_expiration'=> $date_of_expiration ? $date_of_expiration->format('Y-m-d H:i:s') : null,
                'mercadopago_payment_method_id' => $chargeResult->payment_method->id ?? null,
                'mercadopago_installments'      => $chargeResult->installments ?? null,
                'status'                        => $isApproved ? 'approved' : 'pending',
                'credits_granted'               => $isApproved,
            ]);

            if ($isApproved) {
                CreditBatch::create([
                    'user_id'       => $user->id,
                    'type'          => 'addon',
                    'total_credits' => $package->credits,
                    'used_credits'  => 0,
                    'start_date'    => now(),
                    'expires_at'    => now()->addDays($package->validity_days),
                ]);
            }

            return $order->fresh();
        });
    }
}

<?php

namespace App\Services\Checkout;

use App\Helpers\AppHelper;
use App\Models\CreditBatch;
use App\Models\CreditPackage;
use App\Models\CreditPackageOrder;
use App\Services\MercadoPago\MercadoPagoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreditPackagePixService
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
                'payment_form'      => 'pix',
                'status'            => 'pending',
            ]);

            $mercadopagoService = new MercadoPagoService();
            $qrcodePix = $mercadopagoService->generateQrcode([
                'id'          => 'cp_' . $order->id,
                'value'       => $package->price,
                'plan_name'   => $package->name,
                'periodicity' => 'avulso',
                'reference'   => date('m/Y'),
                'email'       => $user->email,
            ]);

            $date_of_expiration = $qrcodePix->date_of_expiration ? new \DateTime($qrcodePix->date_of_expiration) : null;
            $date_created       = $qrcodePix->date_created        ? new \DateTime($qrcodePix->date_created)       : null;
            $date_approved      = $qrcodePix->date_approved       ? new \DateTime($qrcodePix->date_approved)      : null;

            $isApproved = $qrcodePix->status === 'approved';

            $order->update([
                'mercadopago_operation_id'      => $qrcodePix->id,
                'mercadopago_operation_type'    => $qrcodePix->operation_type,
                'payment_status'                => $qrcodePix->status,
                'mercadopago_status_detail'     => $qrcodePix->status_detail,
                'mercadopago_date_created'      => $date_created      ? $date_created->format('Y-m-d H:i:s')      : null,
                'mercadopago_date_approved'     => $date_approved     ? $date_approved->format('Y-m-d H:i:s')     : null,
                'mercadopago_date_of_expiration'=> $date_of_expiration ? $date_of_expiration->format('Y-m-d H:i:s') : null,
                'mercadopago_pix_qrcode'        => $qrcodePix->point_of_interaction->transaction_data->qr_code_base64 ?? null,
                'mercadopago_ticket_url'        => $qrcodePix->point_of_interaction->transaction_data->ticket_url ?? null,
                'mercadopago_copy_and_past'     => $qrcodePix->point_of_interaction->transaction_data->qr_code ?? null,
                'mercadopago_payment_method_id' => $qrcodePix->payment_method->id ?? null,
                'mercadopago_installments'      => $qrcodePix->installments ?? null,
                'status'                        => $isApproved ? 'approved' : 'pending',
                'credits_granted'               => $isApproved,
            ]);

            if ($isApproved) {
                $this->grantCredits($user->id, $package);
            }

            return $order->fresh();
        });
    }

    public function grantCredits(int $userId, CreditPackage $package): CreditBatch
    {
        return CreditBatch::create([
            'user_id'       => $userId,
            'type'          => 'addon',
            'total_credits' => $package->credits,
            'used_credits'  => 0,
            'start_date'    => now(),
            'expires_at'    => now()->addDays($package->validity_days),
        ]);
    }
}

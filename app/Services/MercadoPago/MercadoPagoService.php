<?php

namespace App\Services\MercadoPago;

use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Common\RequestOptions;
use MercadoPago\MercadoPagoConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    private RequestOptions $request_options;
    private PaymentClient $client;
    private $url_base;
    private $token;

    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(env('MERCADO_PAGO_ACCESS_TOKEN'));
        $this->request_options = new RequestOptions();
        $this->client = new PaymentClient();
        $this->url_base = env('MERCADO_PAGO_API', '');
        $this->token = env('MERCADO_PAGO_ACCESS_TOKEN', '');
    }

   
    public function generateQrcode($data)
    {
        $this->request_options->setCustomHeaders(["X-Idempotency-Key: {$data['id']}"]);
  
        $createRequest = [
            "transaction_amount" => (float) $data['value'],
            "payment_method_id" => 'pix',
            "description" => $this->getDescriptionPayment($data),
            "payer" => [
                "email" => $data['email']
            ]
        ];

        if(request()->secure()) {
            $notification_url = env('APP_URL').'/api/v1/sinchronize-status-payment';
            $createRequest['notification_url'] = $notification_url;
        }
           
        return $this->client->create($createRequest, $this->request_options);
    }

    public function chargeCreditCard($data)
    {
        $this->request_options->setCustomHeaders(["X-Idempotency-Key: {$data['id']}"]);
        $createRequest = [
            "transaction_amount" => (float) $data['value'],
            "token" => $data['token'],
            "description" => $this->getDescriptionPayment($data),
            "installments" => (int) $data['installments'],
            "payment_method_id" => $data['payment_method_id'],
            "issuer_id" => $data['issuer_id'],
            'external_reference' => $data['id'],
            "payer" => [
                "email" => $data['email'],
                "identification" => [
                    "type" =>  $data['payer_identification_type'],
                    "number" => $data['payer_identification_number'],
                ],
                "first_name" => $data['first_name'],
                "last_name" => $data['last_name'],
                "phone" => $data['phone']
            ]
        ];

        if(request()->secure()) {
            $notification_url = env('APP_URL').'/api/v1/sinchronize-status-payment';
            $createRequest['notification_url'] = $notification_url;
        }
           
        return $this->client->create($createRequest, $this->request_options);
    }

    private function getDescriptionPayment($data)
    {
        return "{$data['plan_name']} - {$data['periodicity']} - {$data['reference']}";
    }

    public function cancelCharge($id) {
        $data['status'] = 'cancelled';
        $response = Http::withToken($this->token)->put($this->url_base."/payments/$id", $data);

        if($response->successful()) {
            return $response->json();
        }

        return null;
    }

    public function getPayment($id)
    {
        $response = Http::withToken($this->token)->get($this->url_base."/v1/payments/$id");

        if($response->successful()) {
            return $response->json();
        }
    }

    public function createPreApprovalPlan($data)
    {
        $response = Http::withToken($this->token)->post($this->url_base.'/preapproval_plan', $data);

        if($response->successful()) {
            return $response->json();
        }
    }

    public function createSubscription($data)
    {
        $response = Http::withToken($this->token)->post($this->url_base.'/preapproval', $data);

        if($response->successful()) {
            return $response->json();
        }
    }

    public function cancelSubscription($preaprovalId)
    {
        $data['status'] = 'cancelled';

        $response = Http::withToken($this->token)->put($this->url_base."/preapproval/$preaprovalId", $data);

        if($response->successful()) {
            return $response->json();
        }
    }

    public function cancelPreApprovalPlan($preaprovalPlanId)
    {
        $data['status'] = 'cancelled';

        $response = Http::withToken($this->token)->put($this->url_base."/preapproval_plan/$preaprovalPlanId", $data);
        if($response->successful()) {
            return $response->json();
        }
    }

    public function listAppovalPlan()
    {
        $response = Http::withToken($this->token)->get($this->url_base.'/preapproval_plan/search?status=active');
        if($response->successful()) {
            return $response->json()['results'];
        }
    }
}


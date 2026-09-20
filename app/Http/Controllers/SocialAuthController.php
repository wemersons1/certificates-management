<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use App\Enums\RegistrationOriginEnum;
use App\Mail\SendMailNewUserToManagers;
use App\Models\Entity;
use App\Models\EntityContract;
use App\Models\Order;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Models\User;
use App\Services\EntityConfig\UpdateEntityConfigService;
use App\Services\SignUp\SignUpService;
use App\Services\User\CreateUserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SocialAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'provider' => 'required|in:google,linkedin',
            'access_token' => 'required|string',
        ]);

        $provider = $request->input('provider');
        $accessToken = $request->input('access_token');

        try {
            if ($provider === 'google') {
                $resp = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken,
                ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

                if ($resp->failed()) {
                    return response()->json(['message' => 'Invalid Google token'], 422);
                }

                $data = $resp->json();
                $email = $data['email'] ?? null;
                $name = $data['name'] ?? ($data['given_name'] ?? null);
            } else { // linkedin
                // Get basic profile
                $profileResp = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken,
                    'X-Restli-Protocol-Version' => '2.0.0',
                ])->get('https://api.linkedin.com/v2/me');

                if ($profileResp->failed()) {
                    return response()->json(['message' => 'Invalid LinkedIn token'], 422);
                }

                $profile = $profileResp->json();
                $firstName = $profile['localizedFirstName'] ?? null;
                $lastName = $profile['localizedLastName'] ?? null;
                $name = trim(($firstName ?? '') . ' ' . ($lastName ?? '')) ?: null;

                // Get email
                $emailResp = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken,
                ])->get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))');

                if ($emailResp->failed()) {
                    return response()->json(['message' => 'Unable to fetch LinkedIn email'], 422);
                }

                $emailData = $emailResp->json();
                $email = $emailData['elements'][0]['handle~']['emailAddress'] ?? null;
            }

            if (! $email) {
                return response()->json(['message' => 'Email not available from provider'], 422);
            }

            $user = User::where('email', $email)->first();
            $createdViaSocial = false;

            if (! $user) {
                // Create user
                $password = Str::random(16);
                $user = User::create([
                    'name' => $name ?? $email,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => Carbon::now(),
                    'registration_origin' => $provider === 'google'
                        ? RegistrationOriginEnum::GOOGLE->value
                        : RegistrationOriginEnum::LINKEDIN->value,
                ]);
                $createdViaSocial = true;
            }

            if ($createdViaSocial) {
                $emailsToNotify = config('app.emails_to_notify', []);

                if (! empty($emailsToNotify)) {
                    Mail::to($emailsToNotify)
                        ->queue(new SendMailNewUserToManagers($user));
                }
            }

            $user->load(['entity.notificationConfigWhatsapp','menuItems','entity.notificationConfigEmail','permissions','entity.state','entity.city','currentOrder','entity.config','entity.currentContract','entity.contracts.planVersion','entity.contracts.order']);

            return response()->json([
                'user' => $user,
                'token' => $user->createToken($user->email)->plainTextToken,
            ]);

        } catch (\Exception $e) {
            report($e);
            return response()->json(['message' => 'Social login failed'], 500);
        }
    }

    public function linkedinCallback(Request $request)
    {
        try {
            $code = $request->query('code');
            if (! $code) {
                return response('<html><body><script>window.opener.postMessage({error: "Missing code"}, "*");window.close();</script></body></html>', 400);
            }

            $clientId = env('LINKEDIN_CLIENT_ID');
            $clientSecret = env('LINKEDIN_CLIENT_SECRET');
            $redirectUri = env('LINKEDIN_REDIRECT_URI', url('/auth/callback/linkedin'));

            // Exchange authorization code for tokens (OAuth 2.0 with OpenID Connect)
            $tokenResp = Http::asForm()->post('https://www.linkedin.com/oauth/v2/accessToken', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirectUri,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

            if ($tokenResp->failed()) {
                $error = $tokenResp->json();
                return response('<html><body><script>window.opener.postMessage({error: "' . ($error['error_description'] ?? 'Token exchange failed') . '"}, "*");window.close();</script></body></html>', 500);
            }

            $tokenData = $tokenResp->json();
            $accessToken = $tokenData['access_token'] ?? null;

            if (! $accessToken) {
                return response('<html><body><script>window.opener.postMessage({error: "No access token"}, "*");window.close();</script></body></html>', 500);
            }

            // Fetch user info using OpenID Connect userinfo endpoint
            $userinfoResp = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://api.linkedin.com/v2/userinfo');

            if ($userinfoResp->failed()) {
                return response('<html><body><script>window.opener.postMessage({error: "Unable to fetch userinfo"}, "*");window.close();</script></body></html>', 500);
            }
          
            $userinfo = $userinfoResp->json();
            
            $email = $userinfo['email'] ?? null;
            $name = $userinfo['name'] ?? null;
            if (! $name && isset($userinfo['given_name'], $userinfo['family_name'])) {
                $name = trim($userinfo['given_name'] . ' ' . $userinfo['family_name']);
            }

            if (! $email) {
                return response('<html><body><script>window.opener.postMessage({error: "Email not available"}, "*");window.close();</script></body></html>', 422);
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                $userData = [
                    'name' => $name ?? $email,
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)),
                    'is_main_user' => true,
                    'role_id' => RoleEnum::ENTITY->value,
                    'registration_origin' => RegistrationOriginEnum::LINKEDIN->value,
                ];

                $planVersion = PlanVersion::where('monthly_value', 0)
                ->where('annual_value', 0)
                ->orderBy('created_at', 'desc')
                ->first();

                $user = $this->createUser($userData);
                
                Order::create([
                    'user_id' => $user->id,
                    'plan_version_id' => $planVersion->id,
                    'value' => 0,
                    'periodicity' => 'monthly',
                    'status' => 'completed'
                ]);

                $user = $this->createEntity($user);

                $emailsToNotify = config('app.emails_to_notify', []);
                    
                Mail::to($emailsToNotify)
                    ->queue(new SendMailNewUserToManagers($user));
            }

            $user->load(['entity.notificationConfigWhatsapp','menuItems','entity.notificationConfigEmail','permissions','entity.state','entity.city','currentOrder','entity.config','entity.currentContract','entity.contracts.planVersion','entity.contracts.order']);

            // Create Sanctum token
            $sanctumToken = $user->createToken($user->email)->plainTextToken;
    
            $payload = ['token' => $sanctumToken, 'user' => $user];
            $json = json_encode($payload);
            
            // Return HTML page that posts message to opener and closes
            $html = "<html><body><script>window.opener.postMessage($json, '*');window.close();</script></body></html>";
            return response($html, 200)->header('Content-Type', 'text/html');

        } catch (\Exception $e) {
            report($e);
            return response('<html><body><script>window.opener.postMessage({error: "' . $e->getMessage() . '"}, "*");window.close();</script></body></html>', 500);
        }
    }

    public function googleCallback(Request $request)
    {
        try {
            $code = $request->query('code');
            if (! $code) {
                return response('<html><body><script>window.opener.postMessage({error: "Missing code"}, "*");window.close();</script></body></html>', 400);
            }

            $clientId = env('GOOGLE_CLIENT_ID');
            $clientSecret = env('GOOGLE_CLIENT_SECRET');
            $redirectUri = env('GOOGLE_REDIRECT_URI', url('/auth/callback/google'));

            // Exchange authorization code for tokens (OAuth 2.0)
            $tokenResp = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirectUri,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

            if ($tokenResp->failed()) {
                $error = $tokenResp->json();
                return response('<html><body><script>window.opener.postMessage({error: "' . ($error['error_description'] ?? 'Token exchange failed') . '"}, "*");window.close();</script></body></html>', 500);
            }

            $tokenData = $tokenResp->json();
            $accessToken = $tokenData['access_token'] ?? null;

            if (! $accessToken) {
                return response('<html><body><script>window.opener.postMessage({error: "No access token"}, "*");window.close();</script></body></html>', 500);
            }

            // Fetch user info using Google userinfo endpoint
            $userinfoResp = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($userinfoResp->failed()) {
                return response('<html><body><script>window.opener.postMessage({error: "Unable to fetch userinfo"}, "*");window.close();</script></body></html>', 500);
            }

            $userinfo = $userinfoResp->json();
            
            $email = $userinfo['email'] ?? null;
            $name = $userinfo['name'] ?? null;

            if (! $email) {
                return response('<html><body><script>window.opener.postMessage({error: "Email not available"}, "*");window.close();</script></body></html>', 422);
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                $userData = [
                    'name' => $name ?? $email,
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)),
                    'is_main_user' => true,
                    'role_id' => RoleEnum::ENTITY->value,
                    'registration_origin' => RegistrationOriginEnum::GOOGLE->value,
                ];

                $planVersion = PlanVersion::where('monthly_value', 0)
                    ->where('annual_value', 0)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $user = $this->createUser($userData);
                
                Order::create([
                    'user_id' => $user->id,
                    'plan_version_id' => $planVersion->id,
                    'value' => 0,
                    'periodicity' => 'monthly',
                    'status' => 'completed'
                ]);

                $user = $this->createEntity($user);

                $emailsToNotify = config('app.emails_to_notify', []);
                    
                Mail::to($emailsToNotify)
                    ->queue(new SendMailNewUserToManagers($user));
            }

            $user->load(['entity.notificationConfigWhatsapp','menuItems','entity.notificationConfigEmail','permissions','entity.state','entity.city','currentOrder','entity.config','entity.currentContract','entity.contracts.planVersion','entity.contracts.order']);

            // Create Sanctum token
            $sanctumToken = $user->createToken($user->email)->plainTextToken;

            $payload = ['token' => $sanctumToken, 'user' => $user];
            $json = json_encode($payload);
            
            // Return HTML page that posts message to opener and closes
            $html = "<html><body><script>window.opener.postMessage($json, '*');window.close();</script></body></html>";
            return response($html, 200)->header('Content-Type', 'text/html');

        } catch (\Exception $e) {
            report($e);
            return response('<html><body><script>window.opener.postMessage({error: "' . $e->getMessage() . '"}, "*");window.close();</script></body></html>', 500);
        }
    }

    private function createUser($userData)
    {   
        $createUserService = new CreateUserService();

        return $createUserService->execute($userData);
    }

    private function createEntity(&$user, $businessSegmentId = null)
    {
        $loads = [
            'entity.notificationConfigWhatsapp',
            'menuItems', 
            'entity.notificationConfigEmail',
            'permissions',
            'entity.state', 
            'entity.city', 
            'currentOrder',
            'entity.config',
            'entity.currentContract',
            'entity.contracts.planVersion',
            'entity.contracts.order',
            'entity.config.main_user',
            'role'
        ];

        $updateEntityConfigService = new UpdateEntityConfigService();
        
        $entity = Entity::create([
            'name' => $user->name,
            'email' => '',
            'cnpj' => '',
            'business_segment_id' => $businessSegmentId
        ]);
        
        $user->load($loads);

        EntityContract::create([
            'order_id' => $user->currentOrder->id,
            'entity_id' => $entity->id,
            'plan_version_id' => $user->currentOrder->plan_version_id,
            'activation_date' => date('Y-m-d H:i:s'),
            'expiration_date' => Carbon::now()->addDays($user->currentOrder->planVersion->quantity_days)->format('Y-m-d'),
            'value' =>  $user->currentOrder->value,
            'periodicity' => $user->currentOrder->periodicity,
            'registered_by' => $user->id,
            'status' => 'active',
        ]);
    
        $user->entity_id = $entity->id;
        $user->save();
        $validated['config']['main_user_id'] = $user->id;
        // 🔹 Atualiza as configurações da entidade utilizando o service correto
        $configData = [
            'primary_color' => '',
            'secondary_color' => '',
            'main_user_id' => $user->id
        ];
        $config = $updateEntityConfigService->execute($configData, $entity->config_id);
        $entity->config_id = $config->id;
        $entity->save();

        $user->load($loads);

        $user->setAppends(['is_available_for_upgrade']);

        Log::error("USUÁRIO CRIADO VIA SOCIAL LOGIN: " . $user->email);

        return $user;
    }
}

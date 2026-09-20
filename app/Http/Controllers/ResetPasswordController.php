<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use App\Mail\ResetPassword;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ResetPasswordController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'email',
            'entity_id' => 'required'
        ]);

        $token = Hash::make(Str::random(64));

        $user = User::where('email', $request->email)
        ->where('entity_id', $request->entity_id)
        ->first();
        
        if ($user) {
            PasswordResetToken::create([
                'email' => $request->email,
                'token' => $token,
                'used' => false,
                'entity_id' => $request->entity_id,
                'user_id' => $user->id
            ]);

            Mail::to($user?->email)->send(new ResetPassword($user, $token));
        }

        return response()->json([
            'message' => 'Foi encaminhado um link de redefinição de senha pra o e-mail informado'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'password' => 'string|max:255|confirmed',
            'code' => 'required|string'
        ]);

        $passwordResetToken = PasswordResetToken::with(['user'])
        ->where('token', $request->code)
        ->where('used', false)
        ->first();
 
        if ($passwordResetToken) {
            $passwordResetToken->used = true;
            $passwordResetToken->save();
            $user = $passwordResetToken->user;
            $user->password = Hash::make($request->password);
            $user->save();

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
                'permissions'
            ];

            if (
                $user->role_id === RoleEnum::ENTITY->value && 
                $user?->entity?->config?->main_user->id === $user->id
            ) {
                    $loads[] = 'entity.config.main_user';
            }

            $user->load($loads);
                
            return response()->json([
                "user" => $user,
                "token" => $user->createToken($user->email)->plainTextToken
            ]);
        }

        return response()->json([
            'message' => 'Código de confirmação inválido'
        ], Response::HTTP_BAD_REQUEST);
    }
}

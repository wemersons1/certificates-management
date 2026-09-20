<?php

namespace App\Services\Session;

use App\Enums\UserConfirmationCodeEnum;
use App\Mail\SignUp\AccountVerification;
use App\Services\User\FindUserByEmailService;
use App\Services\User\FindUserByIdService;
use App\Services\UserConfirmationCode\CreateUserConfirmationCodeService;
use Illuminate\Support\Facades\Mail;

class RecoverPasswordeService
{
    public function execute($data)
    {
        $createUserConfirmationCodeService = new CreateUserConfirmationCodeService();
        $data['type_id'] = UserConfirmationCodeEnum::RESET_PASSWORD->value;
        $userId = $data['user_id'];
        $confirmationCode = $createUserConfirmationCodeService->execute($data);
        $findUserById = new FindUserByIdService();
        $user = $findUserById->execute($userId);

        Mail::to($user->email)->send(new AccountVerification($confirmationCode->confirmation_code));
    }
}

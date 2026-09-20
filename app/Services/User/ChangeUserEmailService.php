<?php

namespace App\Services\User;

use App\Enums\UserConfirmationCodeEnum;
use App\Mail\SignUp\AccountVerification;
use App\Services\SignUp\ConfirmationCodeService;
use App\Services\UserEmailChange\CreateUserEmailChangeService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ChangeUserEmailService
{
    public function execute($data)
    {
        $email = $data['email'];
        $typeId = UserConfirmationCodeEnum::CHANGE_EMAIL->value;
        $userLogged = Auth::user();
        $confirmationCodeService = new ConfirmationCodeService();
        $confirmationCode = $confirmationCodeService->execute($typeId, $userLogged);

        $dataUserEmailChange['email'] = $email;
        $dataUserEmailChange['user_confirmation_code_id'] = $confirmationCode->id;

        $createUserEmailChangeService = new CreateUserEmailChangeService();
        $createUserEmailChangeService->execute($dataUserEmailChange);

        Mail::to($email)->send(new AccountVerification($confirmationCode->confirmation_code));
    }
}

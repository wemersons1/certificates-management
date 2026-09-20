<?php

namespace App\Enums;

enum RegistrationOriginEnum: string
{
    case WEBSITE = 'website';
    case GOOGLE = 'google';
    case LINKEDIN = 'linkedin';
    case FACEBOOK = 'facebook';

    public function label(): string
    {
        return match($this) {
            self::WEBSITE => 'Site Cadastro',
            self::GOOGLE => 'Google',
            self::LINKEDIN => 'LinkedIn',
            self::FACEBOOK => 'Facebook',
        };
    }
}

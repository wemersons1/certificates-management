<?php

namespace App\Enums;

enum GenderEnum: int
{
    case MALE = 1;
    case FEMALE = 2;
    case NON_BINARY = 3;
    case OTHER = 4;
    case PREFER_NOT_TO_SAY = 5;
}

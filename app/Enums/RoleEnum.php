<?php
namespace App\Enums;

enum RoleEnum: int
{
    case MASTER = 1;
    case ENTITY = 2;
    case COMPANY = 3;
    case EMPLOYEE = 4;
    case LEAD = 5;
}

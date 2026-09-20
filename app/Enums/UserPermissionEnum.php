<?php
namespace App\Enums;

enum UserPermissionEnum: int
{
    case CREATE = 1;
    case UPDATE = 2;
    case DELETE = 3;
}

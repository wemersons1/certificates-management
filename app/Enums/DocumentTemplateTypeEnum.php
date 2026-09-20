<?php
namespace App\Enums;

enum DocumentTemplateTypeEnum: int
{
    case CERTIFICATE = 1;
    case PRESENCE_LIST = 2;
    case CONSENT = 3;
}

<?php
namespace App\Enums;

enum SystemMenuEnum: int
{
    case DASHBOARD = 1;
    case COMPANIES = 2;
    case STUDENTS = 3;
    case CERTIFICATES = 4;
    case TEMPLATES = 5;
    case INSTRUCTORS = 6;
    case POSITIONS = 7;
    case COURSES = 8;
    case USERS = 9;
    case NOTIFICATIONS = 10;
    case SENT_EMAILS = 11;
    case AUDIT_LOGS = 12;
}

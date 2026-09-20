<?php

namespace App\Models;

use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;

class NotificationSend extends Model
{
    use HasFilters;

    protected $fillable = [
        'title',
        'content',
        'type',
        'employee_id',
        'company_id',
        'entity_id',
        'contact',
        'presence_list_id'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function presence_list()
    {
        return $this->belongsTo(PresenceList::class, 'presence_list_id');
    }

    public function entity()
    {
        return $this->belongsTo(Entity::class, 'entity_id');
    }
}
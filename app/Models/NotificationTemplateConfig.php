<?php

namespace App\Models;

use App\Services\Aws\Ses;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplateConfig extends Model
{
    protected $fillable = [
        'title',
        'content',
        'active',
        'send_me',
        'company_ids',
        'employee_ids',
        'quantity_days_for_notification',
        'default_sender',
    ];

    public function entity_config_email()
    {
        return $this->hasOne(Entity::class, 'notification_config_email_id', 'id');
    }

    public function getIsVerifiedAttribute()
    {
        $ses = new Ses();
        
        if ($this->default_sender) {
            try {
                return $ses->alreadVerified($this->default_sender); 
            }catch (\Exception $e) {
                return false;
            }
        }

        return false;
    }
}

<?php

namespace App\Models;

use App\Helpers\BuildTemplate;
use App\Traits\HasFilters;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Document extends Model
{
    use SoftDeletes, HasFilters;

    protected $fillable = [
        'uuid',
        'content_program',
        'date_init_validate',
        'date_end_validate',
        'employee_id',
        'position_id',
        'course_id',
        'certificate_template_version_id',
        'authorization_template_version_id',
        'registered_by_id',
        'entity_id',
        'company_name',
        'company_representative',
        'issue_date',
        'presence_list_id',
        'number_of_hours_studied',
        'email_sent',
        'email_sent_count'
    ];

    protected $casts = [
        'email_sent' => 'boolean',
        'email_sent_count' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            $userLogged = Auth::user();
    
            if ($userLogged && $userLogged->entity_id) {
                $item->entity_id = $userLogged->entity_id;
                $item->registered_by_id = $userLogged->id;
            }
        });
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    public function position()
    {
        return $this->belongsTo(Position::class)->withTrashed();
    }

    public function course()
    {
        return $this->belongsTo(Course::class)->withTrashed();
    }

    public function registered_by()
    {
        return $this->belongsTo(User::class, 'registered_by_id');
    }

    public function presence_list()
    {
        return $this->belongsTo(PresenceList::class, 'presence_list_id');
    }

    public function entity()
    {
        return $this->belongsTo(Entity::class, 'entity_id');
    }

    public function certificate_template()
    {
        return $this->belongsTo(DocumentTemplateVersion::class, 'certificate_template_version_id');
    }

    public function authorization_template()
    {
        return $this->belongsTo(DocumentTemplateVersion::class, 'authorization_template_version_id');
    }

    public function getCertificateTemplateMountedAttribute()
    {
        return BuildTemplate::build($this, $this->certificate_template);
    }

    public function getPresenceListTemplateMountedAttribute()
    {
        return BuildTemplate::build($this, $this->presence_list?->presence_list_template);
    }

    public function getAuthorizationTemplateMountedAttribute()
    {
        return BuildTemplate::build($this, $this->authorization_template);
    }

    public function getEmailSentAttribute()
    {
        return (bool) ($this->attributes['email_sent'] ?? false);
    }
}

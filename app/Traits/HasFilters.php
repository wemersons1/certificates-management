<?php

namespace App\Traits;

use App\Enums\RoleEnum;
use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Attributes\Scope;

trait HasFilters
{
    public function scopeFilter(Builder $query, array $filters = [], User $user = null): Builder
    {
        $userLogged = $user ?? Auth::user();
        
        if ($userLogged->isCompany() && !$userLogged->company_id) {
            throw new Exception('Você naõ tem acesso a este recurso');
        }

        if ($userLogged->isEntity() && !$userLogged->entity_id) {
            throw new Exception('Você naõ tem acesso a este recurso');
        }

        if ($userLogged->isEmployee() && !$userLogged?->employee_id) {
            throw new Exception('Você naõ tem acesso a este recurso');
        }

        if ($userLogged->isEmployee() && !$userLogged?->employee_id) {
            throw new Exception('Você naõ tem acesso a este recurso');
        }
        
        if ($userLogged->isLead() && Schema::hasColumn($query->getModel()->getTable(), 'entity_id')) {
            $query->where('id', '<', 0);
        }

        if (
            Schema::hasColumn($query->getModel()->getTable(), 'company_id') && 
            $userLogged && 
            $userLogged->company_id &&
            $userLogged->role_id == RoleEnum::COMPANY->value
        ) {
            $query->where('company_id', $userLogged->company_id);
        }
      
        if (
            Schema::hasColumn($query->getModel()->getTable(), 'entity_id') && 
            $userLogged && 
            $userLogged->entity_id &&
            $userLogged->role_id == RoleEnum::ENTITY->value
        ) {
            $query->where('entity_id', $userLogged->entity_id);
        }

        foreach ($filters as $field => $value) {
            if (!is_array($value) && !is_null($value) && $field != 'all' && Schema::hasColumn($query->getModel()->getTable(), $field)) {
                if (is_numeric($value) && !in_array($field, ['cnpj', 'cpf'])) {
                    $query->where($field, $value);
                } else {
                    $query->where($field, 'like', '%' . $value . '%');
                }
            }
        }

        return $query;
    }

    #[Scope]
    protected function myScope(Builder $query, array $filters = [], User $user = null): void
    {
        $scopeFilter = $this->scopeFilter($query, $filters, $user);
        if (Schema::hasColumn($query->getModel()->getTable(), 'created_at')) {
            $scopeFilter->orderBy('created_at', 'DESC');      
        }
    }
}

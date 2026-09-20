<?php

namespace App\Observers;

use App\Models\Company;
use Laravel\Sanctum\PersonalAccessToken;

class CompanyObserver
{
    /**
     * Handle the Company "updating" event.
     */
    public function updating(Company $company): void
    {
        // Se active estava true e agora virou false...
        $wasActive = $company->getOriginal('active');
        $isActive  = $company->active;

        if ($wasActive && ! $isActive) {
            // busca todos os IDs de usuário dessa company
            $userIds = $company->users()->pluck('id');

            // revoga todos os tokens Sanctum desses usuários
            PersonalAccessToken::query()
                ->where('tokenable_type', \App\Models\User::class)
                ->whereIn('tokenable_id', $userIds)
                ->delete();
        }
    }
}

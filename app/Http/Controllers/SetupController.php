<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\TermAndCondition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SetupController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $latestVersions = DB::table('plan_versions')
            ->select(DB::raw('plan_id, MAX(created_at) as max_created_at'))
            ->groupBy('plan_id');

        // 2. Junte a sub-query e a tabela de versões para obter os dados da versão mais recente.
        // O join na tabela de versões é necessário para poder filtrar e ordenar.
        $plans = Plan::join('plan_versions', function($join) use ($latestVersions) {
                $join->on('plans.id', '=', 'plan_versions.plan_id')
                     ->joinSub($latestVersions, 'latest_versions', function ($join) {
                         $join->on('plan_versions.plan_id', '=', 'latest_versions.plan_id')
                              ->on('plan_versions.created_at', '=', 'latest_versions.max_created_at');
                     });
            })
            // 4. Ordene a consulta principal (Plan) pela coluna da versão.
            ->orderBy('plan_versions.monthly_value', 'asc')

            // 5. Selecione apenas as colunas do plano para evitar conflitos de nomes.
            ->select('plans.*');
            
        // 6. Opcional: Eager load a versão mais recente para que você possa acessá-la.
        $plansWithVersion = $plans->with('latestVersion')->get();     
                
        $termsAndCondition = TermAndCondition::where('active', true)->first();

        return response()->json([
            'plans' => $plansWithVersion,
            'term_and_condition' => $termsAndCondition
        ]);
    }
}

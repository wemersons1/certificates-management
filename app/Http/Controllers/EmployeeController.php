<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\CreateOrUpdateEmployeeRequest;
use App\Http\Requests\Employee\IndexEmployeeRequest;
use App\Jobs\ImportEmployeesJob;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Gender;
use App\Services\Employee\CreateEmployeeService;
use App\Services\Employee\UpdateEmployeeService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexEmployeeRequest $request)
    {
        $validated = $request->validated();
        $employees = Employee::myScope($validated);
        if (isset($validated['company_ids'])) {
            $employees->whereIn('company_id', $validated['company_ids']);
        }
        
        if (isset($validated['all'])) { 
            return Employee::where('entity_id', Auth::user()->entity_id)
                ->select('id', 'name', 'cpf') // Seleciona o nome para o distinct funcionar
                ->distinct('name', 'cpf')    // Aplica o distinct na coluna name
                ->get();
        }

        return $employees->with(['company', 'gender', 'state', 'city'])->paginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateOrUpdateEmployeeRequest $request)
    {
        $createEmployeeService = new CreateEmployeeService();

        return  $createEmployeeService->execute($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Employee::myScope()
            ->with(['company', 'city', 'state'])
            ->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateOrUpdateEmployeeRequest $request, string $id)
    {
        $updateEmployeeService = new UpdateEmployeeService();

        return $updateEmployeeService->execute($request->validated(), $id);
    }

    public function destroy(string $id)
    {
        $employee = Employee::myScope()->find($id);
        $employee->delete();

        return response()->noContent();
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt']
        ]);
 
        $userLogged = Auth::user();

        $filename = Str::uuid() . '.' . $request->file('file')->getClientOriginalExtension();
    
        $path = $request->file('file')->storeAs('imports', $filename);
        
        ImportEmployeesJob::dispatch($path, $userLogged->entity_id);

        return response()->json(['message' => 'Sua solicitação está sendo processada']);
    }

    public function genders()
    {
        return Gender::all();
    }

    public function employeesBatch(Request $request)
    {
        $request->validate([
            'employees' => ['required', 'array', 'min:1'],
            'employees.*.name' => ['required', 'string', 'max:255'],
            'employees.*.email' => ['nullable', 'string', 'max:255'],
            'employees.*.cpf' => ['nullable', 'string'],
            'employees.*.rg' => ['nullable', 'string'],
            'employees.*.position'  => ['nullable', 'string', 'max:255'],
            'employees.*.machines_operated' => ['nullable', 'string'],
        ]);
       
        $entityId = Auth::user()->entity_id;
        $upsertData = [];

        foreach ($request->employees as $index => $data) {
            // Sanitiza valores (OPCIONAL) ou OPCIONAL para null
            foreach ($data as $key => $value) {
                if (is_string($value)) {
                    $trimmed = trim($value);
                    if ($trimmed === '(OPCIONAL)' || $trimmed === 'OPCIONAL') {
                        $data[$key] = null;
                    }
                }
            }

            if (($data['name'] ?? '') === '(OBRIGATORIO)' || empty($data['name'])) {
                continue;
            }

            $email = $data['email'] ?? null;
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $email = null;
            }

            $cpfNumbers = preg_replace('/\D/', '', (string) ($data['cpf'] ?? ''));
            $cpf = strlen($cpfNumbers) === 11 ? $cpfNumbers : null;
            
            $upsertKey = $cpf ? "cpf:{$cpf}" : 'name:' . trim($data['name']) . ":{$index}";

            $upsertData[$upsertKey] = [
                'entity_id'  => $entityId,
                'name'       => trim($data['name']),
                'email'     => $email,
                'cpf'        => $cpf,
                'rg'         => $data['rg'] ?? null,
                'position'   => $data['position'] ?? null,
                'machines_operated' => $data['machines_operated'] ?? null,
            ];
        }

        if (!count($upsertData)) {
            return response()->json([]);
        }

        $names = collect($upsertData)->pluck('name')->unique()->toArray();
        $cpfs = collect($upsertData)->pluck('cpf')->filter()->unique()->toArray();

        // Busca alunos existentes de uma só vez para evitar consultas N+1
        $existingEmployees = Employee::where('entity_id', $entityId)
            ->where(function($query) use ($names, $cpfs) {
                $query->whereIn('name', $names);
                if (!empty($cpfs)) {
                    $query->orWhereIn('cpf', $cpfs);
                }
            })
            ->get();

        $processedIds = [];

        DB::transaction(function () use ($upsertData, $existingEmployees, $entityId, &$processedIds) {
            foreach ($upsertData as $item) {
                $name = $item['name'];
                $cpf = $item['cpf'];

                // Só damos match de atualização se bater o Nome E CPF exatamente
                $match = $existingEmployees->first(function($emp) use ($name, $cpf) {
                    return $emp->name === $name && $emp->cpf === $cpf;
                });

                if ($match) {
                    // Se der match CPF + nome, apenas atualiza as informações
                    $match->update([
                        'email' => $item['email'] ?? $match->email,
                        'rg' => $item['rg'] ?? $match->rg,
                        'position' => $item['position'] ?? $match->position,
                        'machines_operated' => $item['machines_operated'] ?? $match->machines_operated,
                    ]);
                    $processedIds[] = $match->id;
                } else {
                    // Usa updateOrCreate com as chaves do índice único (entity_id + cpf + name)
                    // para evitar SQLSTATE[23000] Duplicate entry
                    $newEmp = Employee::updateOrCreate(
                        [
                            'entity_id' => $entityId,
                            'cpf'       => $cpf,
                            'name'      => $name,
                        ],
                        [
                            'email'             => $item['email'],
                            'rg'                => $item['rg'],
                            'position'          => $item['position'],
                            'machines_operated' => $item['machines_operated'],
                        ]
                    );
                    $processedIds[] = $newEmp->id;
                }
            }
        });

        // Retorna apenas e exatamente os alunos processados nesta requisição
        $employeesIds = Employee::whereIn('id', $processedIds)
            ->select('id', 'name', 'cpf')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'cpf' => $item->cpf
            ])
            ->toArray();

        return response()->json($employeesIds);
    }

    public function updateEmails(Request $request)
    {
        $request->validate([
            'updates' => ['required', 'array', 'min:1'],
            'updates.*.employee_id' => ['required', 'exists:employees,id'],
            'updates.*.email' => ['required', 'email', 'max:255'],
        ]);

        $entityId = Auth::user()->entity_id;

        DB::transaction(function () use ($request, $entityId) {
            foreach ($request->updates as $update) {
                Employee::where('id', $update['employee_id'])
                    ->where('entity_id', $entityId)
                    ->update(['email' => trim($update['email'])]);
            }
        });

        return response()->json(['message' => 'E-mails atualizados com sucesso.']);
    }
}

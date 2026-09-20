<?php

namespace App\Http\Controllers;

use App\Enums\RoleEnum;
use App\Http\Requests\Entity\CreateEntityRequest;
use App\Http\Requests\Entity\IndexEntityRequest;
use App\Http\Requests\Entity\UpdateEntityRequest;
use App\Models\Entity;
use App\Models\SystemMenu;
use App\Services\Entity\CreateEntityService;
use App\Services\Entity\UpdateEntityService;
use App\Services\EntityConfig\CreateEntityConfigService;
use App\Services\EntityConfig\UpdateEntityConfigService;
use App\Services\User\CreateUserService;
use App\Services\User\UpdateUserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EntityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexEntityRequest $request)
    {
        $validated = $request->validated();

        return isset($validated['all']) ? 
        Entity::myScope($validated)->get() : 
        Entity::myScope($validated)->paginate(); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateEntityRequest $request)
    {
        $validated = $request->validated();
       
        DB::transaction(function () use ($validated) {
            $createEntityConfigService = new CreateEntityConfigService();
            $config = $createEntityConfigService->execute($validated['config']);

            $createEntityService = new CreateEntityService();
            $entity = $createEntityService->execute([
                ...$validated['entity'],
                'config_id' => $config->id,
            ]);

            $createUserService = new CreateUserService();
            $user = $createUserService->execute([
                ...$validated['user'],
                'role_id' => RoleEnum::ENTITY->value,
                'entity_id' => $entity->id,
            ]);
    
            // Atualiza o config agora com o main_user_id
            $config->update([
                'main_user_id' => $user->id,
            ]);

            return $entity;
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Entity $entity)
    {
        if ($entity->config) {
            $entity->config->setAppends(['logo_base64']);
        }

        $entity->load(['city', 'state', 'businessSegment']);
        $entity->config?->load(['main_user']);

        return $entity;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEntityRequest $request, string $id)
    {
        $validated = $request->validated();
     
        return DB::transaction(function () use ($validated, $id) {
            $updateEntityService = new UpdateEntityService();
            $updateEntityConfigService = new UpdateEntityConfigService();
            $userRequest = $validated['user'];
            
            if (isset($userRequest['password']) && strlen($userRequest['password'])) {
                $userRequest['password'] = Hash::make($userRequest['password']);
            } else {
                unset($userRequest['password']);
            }
            
            // 🔹 Atualiza a entidade principal
            $entity = $updateEntityService->execute($validated['entity'], $id);

            // 🔹 Atualiza as configurações da entidade utilizando o service correto
            $config = $updateEntityConfigService->execute($validated['config'], $entity->config_id);

            // 🔹 Atualiza o usuário principal vinculado à entidade
            $config->main_user()->update([
                ...$userRequest,
                'entity_id' => $entity->id, // Garante o ID da entidade atualizada
            ]);

            // 🔹 Carrega os relacionamentos atualizados
            $entity->load(['config', 'config.main_user']);

            return $entity;
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $entity = Entity::with(['users'])->find($id);
        
        foreach ($entity->users as $user) {
            $user->tokens()->delete();
        }
        
        $entity->delete();

        return response()->noContent();
    }

    public function getMenuItems()
    {
        return SystemMenu::all();
    }
}

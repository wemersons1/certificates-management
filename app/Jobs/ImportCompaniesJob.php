<?php

namespace App\Jobs;

use App\Helpers\HelperString;
use App\Models\City;
use App\Models\Company;
use App\Models\Notification;
use App\Models\State;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportCompaniesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 900; // em segundos (15 minutos)
    protected string $path;
    protected int $entityId;
    protected array $cities = [];
    protected array $states = [];

    public function __construct(string $path, int $entityId)
    {
        $this->path = $path;
        $this->entityId = $entityId;
        $this->cities = $this->getCities();
        $this->states = $this->getStates();
    }

    private function getCities(): array
    {
        $cities = [];

        foreach (City::all() as $city) {
            $cities[$city->nome] = $city->id;
        }

        return $cities;
    }

    private function getStates(): array
    {
        $states = [];

        foreach (State::all() as $state) {
            $states[$state->sigla] = $state->id;
        }

        return $states;
    }

    public function handle()
    {
        $file = Storage::get($this->path);
        $lines = explode("\n", $file);
        $total = count($lines) - 1; // remove header
        if ($total <= 0) return;
    
        $header = str_getcsv(array_shift($lines)); // primeira linha
    
        $errorLog = [];
    
        $total = count($lines);

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            try {

                $values = str_getcsv($line);

                if (count($values) < count($header)) {
                    // completa com nulls
                    $values = array_pad($values, count($header), null);
                } elseif (count($values) > count($header)) {
                    // corta o excesso
                    $values = array_slice($values, 0, count($header));
                }
                
                $data = array_combine($header, $values);
        
                Company::updateOrcreate([
                    'entity_id' => $this->entityId ?? null,
                    'external_id' => HelperString::onlyNumbers($data['CNPJ'])
                ],[
                    'name' => $data['RAZAOSOCIAL'] ?? null,
                    'external_id' => HelperString::onlyNumbers($data['CNPJ']),
                    'email' => $data['EMAIL_EMPRESA'] ?? null,
                    'cnpj' => $data['CNPJ'] ? HelperString::onlyNumbers($data['CNPJ']) : null,
                    'entity_id' => $this->entityId ?? null,
                    'phone' => HelperString::onlyNumbers($data['TELEFONE_FIXO']?? null),
                    'cellphone' => HelperString::onlyNumbers($data['CELULAR'] ?? null),
                    'zip_code' => HelperString::onlyNumbers($data['CEP'] ?? null),
                    'street' => $data['RUA'] ?? null,
                    'number' => $data['NUMERO'] ?? null,
                    'complement' => $data['COMPLEMENTO'] ?? null,
                    'neighborhood' => $data['BAIRRO'] ?? null,
                    'state_id' => $this->getStateId($data['ESTADO'] ?? null),
                    'city_id' => $this->getCityId($data['CIDADE'] ?? null),
                    'active' => true,
                ]);
            } catch (\Exception $e) {
                if (strlen(trim($data['RAZAOSOCIAL']))) {
                    $errorLog[] = [
                        'description' => $data['RAZAOSOCIAL'] . "-" . $e->getMessage()
                    ];
                }
            }
        }
  
        Storage::delete($this->path);

        Notification::create([
            'entity_id' => $this->entityId,
            'title' => 'Empresas importadas',
            'errors' => json_encode($errorLog),
            'is_read' => false
        ]);
    }    

    private function getStateId($state): int | null
    {
        return $this->states[$state] ?? null;
    }

    private function getCityId($city): int | null
    {
        return $this->cities[$city] ?? null;
    }
}

<?php

namespace App\Jobs;

use App\Helpers\HelperString;
use App\Models\City;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\State;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportEmployeesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800; // em segundos (15 minutos)
    public $tries = 20;
    protected string $path;
    protected int $entityId;
    protected array $cities = [];
    protected array $states = [];
    protected array $companies = [];
    protected array $employees = [];

    public function __construct(string $path, int $entityId)
    {
        $this->path = $path;
        $this->entityId = $entityId;

        $this->cities = $this->getCities();
        $this->states = $this->getStates();
        $this->companies = $this->getCompanies();
        $this->employees = $this->getEmployees();
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

    private function getCompanies(): array
    {
        $companies = [];

        foreach (Company::where('entity_id', $this->entityId)->where('cnpj', '<>', '')->get() as $company) {
            $companies[(string) $company->cnpj] = $company->id;
        }
        return $companies;
    }

    private function getEmployees(): array
    {
        $employees = [];

        foreach (Employee::where('entity_id', $this->entityId)->get() as $employee) {
            $employees[(string) $employee->external_id] = $employee->id;
        }

        return $employees;
    }

    public function handle()
    {
        $extension = pathinfo($this->path, PATHINFO_EXTENSION);
        $file = null;

        if (strtolower($extension) === 'xlsx') {
            // Se for XLSX, carrega e converte para CSV em memória
            $realPath = Storage::path($this->path);
            $spreadsheet = IOFactory::load($realPath);
            
            $writer = IOFactory::createWriter($spreadsheet, 'Csv');
            $writer->setDelimiter(',');
            $writer->setEnclosure('"');
            $writer->setLineEnding("\n");
            $writer->setSheetIndex(0);

            ob_start();
            $writer->save('php://output');
            $file = ob_get_clean();
            
        } else {
            // Se for CSV ou TXT, lê normalmente
            $file = HelperString::ensureUtf8(Storage::get($this->path));
        }

        $lines = preg_split('/\r\n|\r|\n/', $file);
        $lines = array_filter($lines, fn($value) => !is_null($value) && $value !== '');

        $total = count($lines) - 1; // remove header

        if ($total <= 0) return;

        $header = str_getcsv(array_shift($lines)); // primeira linha

        $errorLog = [];
        $now      = now()->toDateTimeString();

        // ---------------------------------------------------------------
        // Acumula todas as linhas válidas em um array e depois executa
        // um único INSERT ... ON DUPLICATE KEY UPDATE por chunk de 500.
        // Substitui o updateOrCreate por linha (N×2 queries → ~N/500 queries).
        // ---------------------------------------------------------------
        $rows = [];

        foreach ($lines as $i => $line) {
            if (trim($line) === '') {
                continue;
            }

            try {
                $values     = str_getcsv($line);
                $numHeaders = count($header);
                $numValues  = count($values);

                if ($numValues !== $numHeaders) {
                    if ($numValues < $numHeaders) {
                        $values = array_pad($values, $numHeaders, null);
                    } else {
                        $extra         = array_slice($values, $numHeaders);
                        $extraAllEmpty = count(array_filter($extra, fn($v) => trim($v) !== '')) === 0;
                        $values        = array_slice($values, 0, $numHeaders);

                        if (!$extraAllEmpty) {
                            echo "‼️ Linha {$i} tem dados extras inesperados: " . json_encode($extra) . "\n";
                        }
                    }
                }

                $data = array_combine($header, $values);

                // Sanitiza (OPCIONAL) → null
                foreach ($data as $key => $val) {
                    if (is_string($val)) {
                        $trimmed = trim($val);
                        if ($trimmed === '(OPCIONAL)' || $trimmed === 'OPCIONAL') {
                            $data[$key] = null;
                        }
                    }
                }

                $nome = trim($data['NOME'] ?? '');
                if ($nome === '' || $nome === '(OBRIGATORIO)') {
                    continue;
                }

                $email = $data['EMAIL'] ?? null;
                if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $email = null;
                }

                $cpfNormalized = $data['CPF'] ? HelperString::onlyNumbers($data['CPF']) : null;

                // Chave de deduplicação em memória: evita duplicatas dentro do próprio CSV
                $dedupKey = $this->entityId . '|' . ($cpfNormalized ?? '') . '|' . $nome;

                $rows[$dedupKey] = [
                    // Chaves do índice único (usadas no ON DUPLICATE KEY)
                    'entity_id'         => $this->entityId,
                    'cpf'               => $cpfNormalized,
                    'name'              => $nome,
                    // Dados que serão atualizados se já existir
                    'external_id'       => $cpfNormalized,
                    'email'             => $email,
                    'rg'                => $data['RG'] ?? null,
                    'emitting_organ'    => ($data['RG'] ?? null) . ' - ' . ($data['UFRG'] ?? null),
                    'birthday'          => $data['DATA_NASCIMENTO'] ?? null,
                    'phone'             => $data['CELULAR'] ?? null,
                    'cellphone'         => $data['CELULAR'] ?? null,
                    'company_id'        => $this->companies[HelperString::onlyNumbers($data['CNPJ_EMPRESA'] ?? '')] ?? null,
                    'machines_operated' => $data['MAQUINAS_OPERADAS'] ?? null,
                    'position'          => $data['FUNCAO'] ?? null,
                    // Timestamps (upsert bypassa o Eloquent, então gerenciamos manualmente)
                    'updated_at'        => $now,
                    'created_at'        => $now,
                ];

            } catch (\Exception $e) {
                $nome = trim($data['NOME'] ?? '');
                if ($nome !== '') {
                    $errorLog[] = ['description' => $nome];
                }
            }
        }

        // Flush em chunks de 500: cada chunk = 1 query INSERT ... ON DUPLICATE KEY UPDATE
        foreach (array_chunk(array_values($rows), 500) as $chunk) {
            DB::table('employees')->upsert(
                $chunk,
                // Colunas que identificam duplicata (devem bater com o índice único)
                ['entity_id', 'cpf', 'name'],
                // Colunas a atualizar quando já existir o registro
                [
                    'external_id', 'email', 'rg', 'emitting_organ',
                    'birthday', 'phone', 'cellphone', 'company_id',
                    'machines_operated', 'position', 'updated_at',
                ]
            );
        }

        Storage::delete($this->path);

        Notification::create([
            'entity_id' => $this->entityId,
            'title'     => 'Alunos importados',
            'errors'    => json_encode($errorLog),
            'is_read'   => false
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

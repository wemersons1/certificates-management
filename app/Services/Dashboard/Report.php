<?php

namespace App\Services\Dashboard;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Report
{
    private User $userLogged;

    public function __construct()
    {
        $this->userLogged = Auth::user();
    }

    public function execute()
    {
       return [
            'total_by_employees' => $this->getTotalByEmployees(),
            'total_by_courses' => $this->getTotalByCourses(),
            'total_by_companies' => $this->getTotalByCompanies(),
            'total_by_positions' => $this->getTotalByPositions(),
            'total_documents_this_today' => $this->getTotalDocumentsToday(),
            'total_documents_this_week' => $this->getTotalDocumentsThisWeek(),
            'total_documents_by_month' => $this->getTotalDocumentsByMonth(),
            'total_documents_expiring_next_six_months' => $this->getTotalDocumentsExpiringNextSixMonths(),
            'resume' => $this->getResume(),
            'certificates_balance' => $this->getCertificatesBalance()
       ];
    }

    private function getCertificatesBalance()
    {
        if (!$this->userLogged->isEntity() && !$this->userLogged->isCompany()) return null;

        $entity = $this->userLogged->entity;
        if (!$entity || !$entity->currentContract || !$entity->currentContract->planVersion) {
            return null;
        }

        $planVersion = $entity->currentContract->planVersion;
        $limit = $planVersion->quantity_certificates;
        if ($limit === null) return null;

        // Se tiver valor mensal ou anual cadastrado, é pago
        $isPaid = ($planVersion->monthly_value > 0) || ($planVersion->annual_value > 0);

        $query = DB::table('documents')
            ->where('entity_id', $entity->id)
            ->whereNull('deleted_at');

        if ($isPaid) {
            // Planos pagos têm cota mensal
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        }

        $used = $query->count();

        return [
            'limit' => $limit,
            'used' => $used,
            'remaining' => max(0, $limit - $used),
            'is_paid' => $isPaid,
            'plan_name' => $planVersion->name ?? ''
        ];
    }

    private function getTotalByEmployees()
    {
        $whereClousure = '';

        if ($this->userLogged->isEntity()) {
            $whereClousure = "AND d.entity_id = {$this->userLogged->entity_id} ";
        }


        if ($this->userLogged->isCompany()) {
            $whereClousure = $whereClousure . "AND e.company_id = {$this->userLogged->company_id} ";
        }

        return DB::select("
            SELECT COUNT(1) AS total, e.name AS name
            FROM documents AS d
            INNER JOIN employees AS e ON d.employee_id = e.id
            WHERE d.deleted_at IS NULL
            $whereClousure
            GROUP BY d.employee_id
            ORDER BY total DESC
            LIMIT 10;
        ");
    }

    private function getTotalByCourses()
    {
        $whereClousure = '';

        if ($this->userLogged->isEntity()) {
            $whereClousure = "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        return DB::select("
            SELECT COUNT(1) AS total, c.name AS name
            FROM documents AS d
            INNER JOIN courses AS c ON d.course_id = c.id
            WHERE d.deleted_at IS NULL
            $whereClousure
            GROUP BY d.course_id
            ORDER BY total DESC
            LIMIT 10;
        ");
    }

    private function getTotalByCompanies()
    {
        $whereClousure = '';

        if ($this->userLogged->isEntity()) {
            $whereClousure = "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->isCompany()) {
            $whereClousure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        return DB::select("
            SELECT COUNT(1) AS total, c.name AS name
            FROM documents AS d
            INNER JOIN employees AS e ON d.employee_id = e.id
            INNER JOIN companies AS c ON e.company_id = c.id
            WHERE d.deleted_at IS NULL
            $whereClousure
            GROUP BY c.id
            ORDER BY total DESC
            LIMIT 10;
        ");
    }

    private function getTotalByPositions()
    {
        $whereClousure = '';

        if ($this->userLogged->isEntity()) {
            $whereClousure = "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->isCompany()) {
            $whereClousure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        return DB::select("
            SELECT COUNT(1) AS total, p.name AS name
            FROM documents AS d
            INNER JOIN positions AS p ON d.position_id = p.id
            INNER JOIN employees AS e ON d.employee_id = e.id   
            WHERE d.deleted_at IS NULL
            $whereClousure
            GROUP BY p.id
            ORDER BY total DESC
            LIMIT 10;
        ");
    }

    private function getTotalDocumentsToday()
    {
        $whereClousure = '';

        if ($this->userLogged->isEntity()) {
            $whereClousure = "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->isCompany()) {
            $whereClousure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        return DB::selectOne("
            SELECT COUNT(*) AS total
            FROM documents as d
            INNER JOIN employees AS e ON d.employee_id = e.id  
            WHERE DATE(d.created_at) = CURDATE()
            AND d.deleted_at IS NULL
            $whereClousure
        ");
    }

    private function getTotalDocumentsThisWeek(): array
    {
         $whereClausure = ''; // Corrected spelling

        if (isset($this->userLogged->entity_id)) {
                $whereClausure .= "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->company_id) {
            $whereClausure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        $results = DB::select("
            SELECT
 
                CASE dia_numero
                    WHEN 1 THEN 'Domingo'
                    WHEN 2 THEN 'Segunda-feira'
                    WHEN 3 THEN 'Terça-feira'
                    WHEN 4 THEN 'Quarta-feira'
                    WHEN 5 THEN 'Quinta-feira'
                    WHEN 6 THEN 'Sexta-feira'
                    WHEN 7 THEN 'Sábado'
                END AS name,
                COUNT(*) AS total
            FROM (
                SELECT DAYOFWEEK(d.created_at) AS dia_numero
                FROM documents as d
                INNER JOIN employees AS e ON d.employee_id = e.id  
                WHERE YEARWEEK(d.created_at, 1) = YEARWEEK(CURDATE(), 1)
                AND d.deleted_at IS NULL
                $whereClausure
            ) AS dias
            GROUP BY dia_numero
            ORDER BY dia_numero
        ");

        return $results;
    }

    private function getTotalDocumentsByMonth(): array
    {
        $whereClausure = ''; // Corrected spelling

        if (isset($this->userLogged->entity_id)) {
                $whereClausure .= "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->company_id) {
            $whereClausure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        $results = DB::select("
            SELECT
                CASE month_num
                    WHEN 1 THEN 'Janeiro'
                    WHEN 2 THEN 'Fevereiro'
                    WHEN 3 THEN 'Março'
                    WHEN 4 THEN 'Abril'
                    WHEN 5 THEN 'Maio'
                    WHEN 6 THEN 'Junho'
                    WHEN 7 THEN 'Julho'
                    WHEN 8 THEN 'Agosto'
                    WHEN 9 THEN 'Setembro'
                    WHEN 10 THEN 'Outubro'
                    WHEN 11 THEN 'Novembro'
                    WHEN 12 THEN 'Dezembro'
                END AS name,
                total_count AS total
            FROM (
                SELECT
                    MONTH(d.created_at) AS month_num,
                    COUNT(*) AS total_count
                FROM documents as d
                INNER JOIN employees AS e ON d.employee_id = e.id  
                WHERE YEAR(d.created_at) = YEAR(CURDATE())
                AND d.deleted_at IS NULL
                $whereClausure
                GROUP BY MONTH(d.created_at)
            ) AS monthly_data
            ORDER BY month_num
        ");

        return $results;
    }

    private function getTotalDocumentsExpiringNextSixMonths(): array
    {
        $whereClausure = '';

        if ($this->userLogged->isEntity()) {
            $whereClausure .= "AND d.entity_id = {$this->userLogged->entity_id} ";
        }

        if ($this->userLogged->isCompany()) {
            $whereClausure .= "AND e.company_id = {$this->userLogged->company_id} ";
        }

        $results = DB::select("
            SELECT
                DATE_FORMAT(STR_TO_DATE(CONCAT(year_val, '-', month_val, '-01'), '%Y-%c-%d'), '%b/%Y') AS name,
                total_count AS total
            FROM (
                SELECT
                    YEAR(d.date_end_validate) AS year_val,
                    MONTH(d.date_end_validate) AS month_val,
                    COUNT(*) AS total_count
                FROM documents AS d
                INNER JOIN employees AS e ON d.employee_id = e.id
                WHERE d.date_end_validate >= CURDATE()
                AND d.date_end_validate < DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
                AND d.deleted_at IS NULL
                $whereClausure
                GROUP BY year_val, month_val
            ) AS monthly_expirations
            ORDER BY year_val, month_val
        ");

        return $results;
    }

    private function getResume(): array
    {
        $whereClousureEmployees = '';
        $whereClousureCourses = '';
        $whereClousureCompanies = '';
        $whereClousureDocuments = '';

        if ($this->userLogged->isEntity()) {
            $entityId = $this->userLogged->entity_id;
            $whereClousureEmployees .= "AND entity_id = {$entityId} ";
            $whereClousureCourses .= "AND entity_id = {$entityId} ";
            $whereClousureCompanies .= "AND entity_id = {$entityId} ";
            $whereClousureDocuments .= "AND d.entity_id = {$entityId} ";
        }

        if ($this->userLogged->isCompany()) {
            $companyId = $this->userLogged->company_id;
            $whereClousureEmployees .= "AND company_id = {$companyId} ";
            $whereClousureDocuments .= "AND e.company_id = {$companyId} ";
        }

        $totalDocumentsToday = DB::selectOne("
            SELECT COUNT(*) AS total
            FROM documents AS d
            INNER JOIN employees AS e ON d.employee_id = e.id
            WHERE DATE(d.created_at) = CURDATE()
            AND d.deleted_at IS NULL
            $whereClousureDocuments
        ")->total;

        $totalEmployees = DB::selectOne("
            SELECT COUNT(DISTINCT d.employee_id) AS total
            FROM documents AS d
            INNER JOIN employees AS e ON d.employee_id = e.id
            WHERE d.deleted_at IS NULL
            $whereClousureDocuments
        ")->total;

        $totalCourses = DB::selectOne("
            SELECT COUNT(*) AS total
            FROM courses
            WHERE deleted_at IS NULL
            $whereClousureCourses
        ")->total;

        $totalCompanies = DB::selectOne("
            SELECT COUNT(*) AS total
            FROM companies
            WHERE deleted_at IS NULL
            $whereClousureCompanies
        ")->total;

        return [
            'documents_today' => $totalDocumentsToday,
            'employees_count' => $totalEmployees,
            'courses_count' => $totalCourses,
            'companies_count' => $totalCompanies,
        ];
    }
}


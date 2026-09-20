import { useState, useEffect } from 'react';
import api from '@/src/lib/api';

interface DocumentData {
    id: number;
    title: string;
    company_name: string;
    expiration_date: string;
    document_type: string;
    days_until_expiration?: number;
    link?: string;
}

interface DocumentTypeData {
    document_type: string;
    count: number;
}

interface DocumentMonthData {
    month: string;
    count: number;
}

interface DashboardData {
    total_companies: number;
    total_employees: number;
    total_documents: number;
    total_attachments: number;
    documents_to_expire: number;
    expired_documents: number;
    expired_documents_list: DocumentData[];
    documents_to_expire_list: DocumentData[];
    documents_by_type: DocumentTypeData[];
    documents_by_month: DocumentMonthData[];
}

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData>({
        total_companies: 0,
        total_employees: 0,
        total_documents: 0,
        total_attachments: 0,
        documents_to_expire: 0,
        expired_documents: 0,
        expired_documents_list: [],
        documents_to_expire_list: [],
        documents_by_type: [],
        documents_by_month: []
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Erro ao carregar dados do dashboard:', err);
                setError('Erro ao carregar dados do dashboard. Por favor, tente novamente.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}; 
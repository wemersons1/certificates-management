import { useEffect, useState } from "react";
import api from "@/src/lib/api";

interface ClientPerPlan {
    plan_name: string;
    clients_count: number;
}

interface ClientPerContractStatus {
    contract_status_name: string;
    clients_count: number;
}

interface DashboardAdminData {
    total_clients: number;
    clients_per_plan: ClientPerPlan[];
    clients_per_contract_status: ClientPerContractStatus[];
}

interface DashboardAdminMetrics {
    data: DashboardAdminData;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardAdminMetrics = {
    data: {
        total_clients: 0,
        clients_per_plan: [],
        clients_per_contract_status: [],
    },
    loading: true,
    error: null,
};

export const useDashboardAdminData = () => {
    const [dashboardAdminData, setDashboardAdminData] = useState<DashboardAdminMetrics>(initialState);

    useEffect(() => {
        const fetchData = async () => {
            setDashboardAdminData((prevState) => ({ ...prevState, loading: true }));

            try {
                const response = await api.get('/admin/dashboard');

                const { total_clients, clients_per_plan, clients_per_contract_status } = response.data;

                setDashboardAdminData({
                    data: {
                        total_clients,
                        clients_per_plan,
                        clients_per_contract_status,
                    },
                    loading: false,
                    error: null,
                });
            } catch (err) {
                console.error('Error fetching admin dashboard data:', err);
                setDashboardAdminData((prevState) => ({
                    ...prevState,
                    loading: false,
                    error: 'Erro ao carregar os dados da dashboard administrativa',
                }));
            }
        };

        fetchData();
    }, []);

    return dashboardAdminData;
};
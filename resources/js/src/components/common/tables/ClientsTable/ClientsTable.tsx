// ClientsTable.tsx
import { FC } from "react";
import { Table } from "react-bootstrap";
import { formatSimpleDate } from "@/src/lib/helper";
import TableSkeleton from "../../skeletons/TableSkeleton";
import moment from "moment";
import PlanBadgeAdmin from "../../../utils/admin/plans-badge/PlanBadgeAdmin";
import ContractStatusBadge from "../../../utils/admin/contract-status-badge/ContractStatusBadge";



interface Client {
    client_id: number;
    user_name: string;
    user_email: string;
    client_status: string;
    client_created_at: string;
    contract_id: number;
    plan_name: string;
    periodicity_name: string;
    contract_status_name: string;
    contract_created_at: string;

}

interface ClientsTableProps {
    clients: Client[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    isLoading: boolean; 
}

const ClientsTable: FC<ClientsTableProps> = ({ clients, currentPage, totalPages, onPageChange, onPerPageChange, isLoading}) => {

    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                    <th style={{borderRight: '1px solid #dee2e6'}}>Id</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Nome</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>E-mail</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Status Cliente</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Data de Cadastro</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Plano</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Status Contrato</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Data Ativação</th>
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={8} rows={5} /> 
                ) : clients.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={8} className="text-center py-3">
                                <span className="text-muted">Nenhum cliente encontrado</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.client_id}>
                                <td>{client.client_id}</td>
                                <td>{client.user_name}</td>
                                <td>{client.user_email}</td>
                                <td>{client.client_status}</td>
                                <td>{moment(client.client_created_at).format("DD/MM/YYYY HH:mm")}</td>
                                <td><PlanBadgeAdmin name={client.plan_name}/></td>
                                <td><ContractStatusBadge name={client.contract_status_name}/></td>
                                <td>{client.contract_created_at ? moment(client.contract_created_at).format("DD/MM/YYYY HH:mm") : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                )}
                
            </Table> 

                            

            
        </div>
    );
};

export default ClientsTable;

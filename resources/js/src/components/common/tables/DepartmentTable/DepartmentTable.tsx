import React, { FC } from "react";
import { Table } from "react-bootstrap";
import { brazilianMoney, colombianMoney, usMoney } from "@/src/lib/helper";
import TableSkeleton from "../../skeletons/TableSkeleton";
import EffectivenessBadge from "../../effectiveness-badge/EffectivenessBadge";

interface Department {
    position?: number;
    state: string;
    total_orders: number;
    confirmed_orders: number;
    delivery_rate: number;
    delivery_effectiveness: number;
    average_shipping_amount: string;
    average_delivered_shipping_amount: string;
    average_devolution_shipping_amount: string;
    total_revenue: string;
}

interface DepartmentTableProps {
    departments: Department[];
    type: "logistics" | "revenue";
    isLoading: boolean; 
}

const DepartmentTable: FC<DepartmentTableProps> = ({ departments, isLoading, type }) => {
    const currency = "BRL";

    const formatCurrency = (value: string, currency: string) => {
        switch (currency) {
            case "COP":
                return colombianMoney(value);
            case "USD":
                return usMoney(value);
            case "BRL":
                return brazilianMoney(value);
            default:
                return value;
        }
    };

    const placeholderRows = new Array(5).fill(null);

    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                {type === "logistics" ? (
                        <tr>
                            <th style={{borderRight: '1px solid #dee2e6'}}>#</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Departamento</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Total de Pedidos</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete</th>                            
                            <th style={{borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete Entregue</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Custo Médio Frete Devolvido</th>
                        </tr>

                    ) : (
                        <tr>
                            <th style={{ borderRight: '1px solid #dee2e6' }}>#</th>
                            <th style={{ borderRight: '1px solid #dee2e6' }}>Departamento</th>
                            <th style={{ borderRight: '1px solid #dee2e6' }}>Faturamento</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>
                            <th style={{borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {isLoading ? (
                        <TableSkeleton columns={type === "logistics" ? 8 : 5} rows={5} />
                    ) : departments.length === 0 ? (
                        <>
                            <tr>
                                <td
                                    colSpan={type === "logistics" ? 8 : 5}
                                    className="text-center py-3 text-muted"
                          
                                >
                                    <span className="text-muted">Nenhum dado encontrado</span>
                                </td>
                            </tr>
                            {}
                            {placeholderRows.map((_, index) => (
                                <tr key={index}>
                                    <td colSpan={type === "logistics" ? 8 : 5} style={{ height: "37px" }}></td>
                                </tr>
                            ))}
                        </>
                    ) : (
                        departments.map((department) => (
                            <tr key={department.position}>
                                <td className="fw-semibold">{department.position}</td>
                                <td>{department.state}</td>
                                {type === "logistics" ? (
                                    <>
                                        <td>{department.total_orders}</td>
                                        <td>
                                            <EffectivenessBadge value={Math.round(department.delivery_rate)} type="rate" />
                                        </td>
                                        <td>{formatCurrency(department.average_shipping_amount, currency)}</td>
                                        <td>
                                            <EffectivenessBadge value={Math.round(department.delivery_effectiveness)} type="effectiveness" />
                                        </td>
                                        <td>{formatCurrency(department.average_delivered_shipping_amount, currency)}</td>
                                        <td>{formatCurrency(department.average_devolution_shipping_amount, currency)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatCurrency(department.total_revenue, currency)}</td>
                                        <td>
                                            <EffectivenessBadge value={Math.round(department.delivery_rate)} type="rate" />
                                        </td>
                                        <td>
                                            <EffectivenessBadge value={Math.round(department.delivery_effectiveness)} type="effectiveness" />
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default DepartmentTable;

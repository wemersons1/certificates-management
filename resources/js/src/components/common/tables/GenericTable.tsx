import React, { FC, ReactNode } from "react";
import { Table } from "react-bootstrap";
import TableSkeleton from "../skeletons/TableSkeleton";

interface Column<T> {
    title: string;
    key: keyof T;
    render?: (value: T[keyof T], row: T) => ReactNode; // Função opcional para customizar a renderização
}

interface GenericTableProps<T> {
    columns: Column<T>[]; // Array de colunas genéricas
    data: T[];
    isLoading: boolean;
    actions?: (row: T) => ReactNode; // Função opcional para renderizar ações
    skeletonRows?: number;
    skeletonColumns?: number;
    noDataText?: string; // Texto para exibir quando não há dados
}

const GenericTable = <T,>({
    columns,
    data,
    isLoading,
    actions,
    skeletonRows = 5,
    skeletonColumns = 3,
    noDataText = "Nenhum dado encontrado",
}: GenericTableProps<T>) => {
    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ borderRight: "1px solid #dee2e6" }}>
                                {col.title}
                            </th>
                        ))}
                        {actions && <th style={{ borderRight: "1px solid #dee2e6" }}>Ações</th>}
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={skeletonColumns} rows={skeletonRows} />
                ) : data.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-3">
                                <span className="text-muted">{noDataText}</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(row[col.key], row) : (row[col.key] as ReactNode)}
                                    </td>
                                ))}
                                {actions && (
                                    <td>
                                        <div className="hstack gap-2 fs-15">{actions(row)}</div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                )}
            </Table>
        </div>
    );
};

export default GenericTable;

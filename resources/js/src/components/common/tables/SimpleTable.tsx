import React, { FC, ReactNode } from "react";
import { Table } from "react-bootstrap";

interface Column<T> {
    title: string;
    key: keyof T;
    render?: (value: T[keyof T], row: T) => ReactNode;
}

interface SimpleTableProps<T> {
    columns: Column<T>[];
    data: T[];
    noDataText?: string;
}

const SimpleTable: FC<SimpleTableProps<any>> = ({ columns, data, noDataText = "Nenhum dado encontrado" }) => {
    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ borderBottom: "1px solid #dee2e6"}}>
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-3">
                                <span className="text-muted">{noDataText}</span>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: "1px solid #dee2e6" }}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default SimpleTable;

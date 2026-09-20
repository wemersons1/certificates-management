import React, { FC } from "react";
import { Table } from "react-bootstrap";
import { brazilianMoney, colombianMoney, usMoney } from "@/src/lib/helper";
import TableSkeleton from "../../skeletons/TableSkeleton";
import EffectivenessBadge from "../../effectiveness-badge/EffectivenessBadge";

interface Product {
    position?: number;
    product_name: string;
    confirmed_orders: number;
    delivery_rate: number;
    delivery_effectiveness: number;
    average_shipping_amount: string;
    average_delivered_shipping_amount: string;
    total_revenue: string;
}

interface ProductRankingTableProps {
    products: Product[];
    type: "logistics" | "revenue";
    isLoading: boolean;
}

const ProductRankingTable: FC<ProductRankingTableProps> = ({ products, isLoading, type }) => {
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
                      <th style={{ borderRight: '1px solid #dee2e6' }}>#</th>
                      <th style={{ borderRight: '1px solid #dee2e6' }}>Produto</th>
                      <th style={{ borderRight: '1px solid #dee2e6' }}>Faturamento</th>
                      <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>
                      <th style={{ borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                  </tr>
                    ) : (
                        <tr>
                        <th style={{ borderRight: '1px solid #dee2e6' }}>#</th>
                        <th style={{ borderRight: '1px solid #dee2e6' }}>Produto</th>
                        <th style={{ borderRight: '1px solid #dee2e6' }}>Faturamento</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>
                        <th style={{ borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                    </tr>
                    )}
                </thead>
                <tbody>
                    {isLoading ? (
                        <TableSkeleton columns={5} rows={5} />
                    ) : products.length === 0 ? (
                        <>
                            
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-3 text-muted"
                                    style={{ color:"rgb(80," }}
                                >
                                    <span className="text-muted">Nenhum dado encontrado</span>
                                </td>
                            </tr>
                      
                            {placeholderRows.map((_, index) => (
                                <tr key={index}>
                                    <td colSpan={5} style={{ height: "37px" }}></td>
                                </tr>
                            ))}
                        </>
                    ) : (
                        products.map((product) => (
                            <tr key={product.position}>
                                <td className="fw-semibold">{product.position}</td>
                                <td>{product.product_name}</td>
                                {type === "logistics" ? (
                                    <>
                                        <td>{product.confirmed_orders}</td>
                                        <td>
                                            <EffectivenessBadge
                                                value={Math.round(product.delivery_rate)}
                                                type="rate"
                                            />
                                        </td>
                                        <td>
                                            <EffectivenessBadge
                                                value={Math.round(product.delivery_effectiveness)}
                                                type="effectiveness"
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{formatCurrency(product.total_revenue, currency)}</td>
                                        <td>
                                            <EffectivenessBadge
                                                value={Math.round(product.delivery_rate)}
                                                type="rate"
                                            />
                                        </td>
                                        <td>
                                            <EffectivenessBadge
                                                value={Math.round(product.delivery_effectiveness)}
                                                type="effectiveness"
                                            />
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

export default ProductRankingTable;

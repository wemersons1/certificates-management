// ProductsTable.tsx
import { FC, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import PlatformBadge from "../../../utils/ads/PlatformBadge/PlatformBadge";
import { brazilianMoney, colombianMoney, formatSimpleDate, usMoney } from "@/src/lib/helper";
import EditButton from "../../table-buttons/EditButton";
import DeleteButton from "../../table-buttons/DeleteButton";
import usaFlag from "../../../../assets/images/flags/usaFlag.svg"
import brazilFlag from "../../../../assets/images/flags/brazilFlag.svg"
import colombiaFlag from "../../../../assets/images/flags/colombiaFlag.svg"
import CurrencyBadge from "../../currency-badge/currencyBadge";
import TableSkeleton from "../../skeletons/TableSkeleton";
import EffectivenessBadge from "../../effectiveness-badge/EffectivenessBadge";
import StoreLogo from "../../../utils/storelogo/storelogo";
import CustomBadge from "../../custom-badge/CustomBadge";
import { Link } from "react-router-dom";

interface Product {
    product_id?: number;
    name: string;
    total_orders: number;
    confirmed_orders: number;
    confirmation_rate: number;
    delivered_orders: number;
    canceled_orders: number;
    devolution_orders: number;
    delivery_rate: number;
    delivery_effectiveness: number;
    total_revenue: number;
    amount_earned_revenue: number;
    devolution_shipping_cost: number;
}

interface ProductsTableProps {
    products: Product[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    isLoading: boolean; 
}

const ProductsTable: FC<ProductsTableProps> = ({ products, currentPage, totalPages, onPageChange, onPerPageChange, isLoading}) => {
    const [adValue, setAdValue] = useState<{ [key: number]: string}>({})
    let backgroundProfit = '49, 194, 153';    

    const calculateProfit = (revenue: number, adSpend: string) => {
        const revenueValue = revenue;
        const adSpendValue = (parseFloat(adSpend.replace(/[^\d-]/g, '')) / 100) || 0; 
        if((revenueValue - adSpendValue) >= 0){
            backgroundProfit = '49, 194, 153';
        }
        else{
            backgroundProfit = '230, 83, 60';
        }
        return revenueValue - adSpendValue;
    };

    const handleAdSpendChange = (productId: number, value: string) => {        
        let inputValue = value.replace(/\D/g, '');
        
        const numericValue = inputValue ? parseFloat(inputValue) / 100 : 0;
        
        let formattedValue;    
       
        formattedValue = numericValue
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            .replace('R$', '')
            .trim();
        formattedValue = `R$ ${formattedValue}`;
        
        
        setAdValue((prevValues) => ({
            ...prevValues,
            [productId]: formattedValue,
        }));

        console.log(products)
    };


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

    const isAllZero = (product: Product) => {
        return (
            product.total_orders === 0 &&
            product.confirmed_orders === 0 &&
            Number(product.confirmation_rate) === 0 &&
            product.delivered_orders === 0 &&
            product.canceled_orders === 0 &&
            product.devolution_orders === 0 &&
            Number(product.total_revenue) === 0 &&
            Number(product.amount_earned_revenue) === 0 &&
            Number(product.devolution_shipping_cost) === 0 &&
            Number(product.delivery_rate) === 0 &&
            Number(product.delivery_effectiveness) === 0
        );
    };

    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                        <th style={{borderRight: '1px solid #dee2e6'}}>Nome</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Pedidos</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Entregues</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Confirmação</th> 
                        <th style={{borderRight: '1px solid #dee2e6' }}>Taxa de Entrega</th>                          
                        <th style={{borderRight: '1px solid #dee2e6' }}>Efetividade de Entrega</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Receita Bruta</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Anúncio Manual</th>
                        <th style={{borderRight: '1px solid #dee2e6' }}>Lucro</th>
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={9} rows={5} /> 
                ) : products.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={9} className="text-center py-3">
                                <span className="text-muted">Nenhum produto encontrado</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.product_id}>
                                {isAllZero(product) ? (
                                    <>
                                        <td>{product.name}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>                    
                                        <td>-</td>
                                        <td>-</td>                    
                                        <td>-</td>
                                    </>
                                ) : (
                                    <>
                                        <td><Link to={`/dashboard?product_id=${product.product_id}&product_name=${product.name}`}>{product.name}</Link></td>
                                        <td>{product.total_orders}</td>
                                        <td>{product.delivered_orders}</td>
                                        <td>{<EffectivenessBadge value = {Math.round(product.confirmation_rate)} type="rate"/>}</td>
                                        <td>{<EffectivenessBadge value = {Math.round(product.delivery_rate)} type="rate"/>}</td>              
                                        <td>{<EffectivenessBadge value = {Math.round(product.delivery_effectiveness)} type="effectiveness"/>}</td>                    
                                        <td><CustomBadge value = {formatCurrency(product.amount_earned_revenue.toString(), "BRL")} background="245, 184, 73"/></td>
                                        <td>
                                            <input
                                                type="text"
                                                value={(adValue[product.product_id!] || "")}
                                                onChange={(e) => handleAdSpendChange(product.product_id!, e.target.value)}
                                                placeholder="Insira o valor"
                                                className="form-control w-75"
                                            />
                                        </td>
                                        <td>
                                            <CustomBadge value = {brazilianMoney(calculateProfit((product.amount_earned_revenue - product.devolution_shipping_cost), adValue[product.product_id!] || "0"))} background={backgroundProfit}/>
                                        </td>
                                    </>
                                )}                                

                            </tr>
                        ))}
                    </tbody>
                )}
                
            </Table>
        </div>
    );
};

export default ProductsTable;

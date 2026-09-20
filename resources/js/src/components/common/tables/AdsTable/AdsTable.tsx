// AdsTable.tsx
import { FC } from "react";
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

import mexicoFlag from "../../../../assets/images/flags/flagMexico.svg"
import chileFlag from "../../../../assets/images/flags/flagChile.svg"
import panamaFlag from "../../../../assets/images/flags/flagPanama.svg"
import paraguayFlag from "../../../../assets/images/flags/flagParaguay.svg"
import peruFlag from "../../../../assets/images/flags/flagPeru.svg"
import UERFlag from "../../../../assets/images/flags/flagUER.svg"



interface Ad {
    id?: number;
    date: string;
    platform: string;
    currency: string;
    value_invested: string;
    product_tag: string;
}

interface AdsTableProps {
    ads: Ad[];
    onEdit: (ad: Ad) => void;
    onDelete: (id?: number) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    isLoading: boolean; 
}

const getLocaleByCurrency = (currency: string): string => {
    const localeMap = {
        BRL: 'pt-BR',
        USD: 'en-US',
        COP: 'es-CO',
        EUR: 'de-DE',
        MXN: 'es-MX',
        PAB: 'es-PA',
        PEN: 'es-PE',
        PYG: 'es-PY',
        CLP: 'es-CL',
        JPY: 'ja-JP',
        KRW: 'ko-KR',
    };

    return localeMap[currency] || 'en-US'; 
};



const AdsTable: FC<AdsTableProps> = ({ ads, onEdit, onDelete, currentPage, totalPages, onPageChange, onPerPageChange, isLoading}) => {
    const formatCurrency = (value: string | number, currency: string): string => {
  
        if (isNaN(Number(value))) return value.toString();
    
        const formattedValue = new Intl.NumberFormat(getLocaleByCurrency(currency), {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }).format(Number(value));
    
        return formattedValue.replace(/(\D+)(\d)/, '$1 $2');
    };
    const currencyFlag = (currency: string) => {
        const flags: { [key: string]: string } = {
            COP: colombiaFlag,  
            BRL: brazilFlag,    
            USD: usaFlag,      
            MXN: mexicoFlag,    
            PAB: panamaFlag,    
            PEN: peruFlag,      
            EUR: UERFlag,        
            PYG: paraguayFlag, 
            CLP: chileFlag,    
        };
    
        return flags[currency] || brazilFlag;  
    };
    
    return (
        <div className="table-responsive">
            <Table className="table text-nowrap">
                <thead>
                    <tr>
                    <th style={{borderRight: '1px solid #dee2e6'}}>Data</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Plataforma</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Moeda</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Valor</th>
                    <th style={{borderRight: '1px solid #dee2e6' }}>Tag de Produto</th>
                    <th>Ação</th>
                    </tr>
                </thead>
                {isLoading ? (
                    <TableSkeleton columns={6} rows={5} /> 
                ) : ads.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={6} className="text-center py-3">
                                <span className="text-muted">Nenhum anúncio encontrado</span>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {ads.map((ad) => (
                            <tr key={ad.id}>
                                <td>{formatSimpleDate(ad.date)}</td>
                                <td><PlatformBadge name={ad.platform} /></td>
                                <td><CurrencyBadge name={ad.currency} flagIcon={currencyFlag(ad.currency)} /></td>
                                <td>{formatCurrency(ad.value_invested, ad.currency)}</td>
                                <td>{ad.product_tag ?? "-"}</td>
                                <td>
                                    <div className="hstack gap-2 fs-15">
                                        <EditButton onClick={() => onEdit(ad)} />
                                        <DeleteButton onClick={() => onDelete(ad.id)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
                
            </Table>

                            

            
        </div>
    );
};

export default AdsTable;

import React, { useEffect } from 'react';

interface CotacaoPesoColombianoProps {
    setCotacaoPesoColombiano: (value: number) => void;
}

const CotacaoPesoColombiano: React.FC<CotacaoPesoColombianoProps> = ({ setCotacaoPesoColombiano }) => {
    useEffect(() => {
        const apiUrl = "https://economia.awesomeapi.com.br/json/daily/COP-BRL/";

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar a cotação');
                }
                return response.json();
            })
            .then(data => {
                const bidValor = parseFloat(data[0].bid);
                setCotacaoPesoColombiano(bidValor); 
            })
            .catch(err => {
                console.error(err);
            });
    }, [setCotacaoPesoColombiano]);

    return null; 
};

export default CotacaoPesoColombiano;

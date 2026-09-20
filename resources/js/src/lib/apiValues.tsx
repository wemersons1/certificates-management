import React, { useEffect, useState } from 'react';
import CardsContainer from '../components/common/cards/cardsconteiner';

const ParentComponent: React.FC = () => {
  const [cardValues, setCardValues] = useState({
    Marketing: 0,
    Vendas: 0,
    Funcionarios: 0,
    Operacional: 0,
  });
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/get-conversion'); 
        const data = await response.json();

        setCardValues({
          Marketing: data.total_by_cost_center.Marketing || 0,
          Vendas: data.total_by_cost_center.Vendas || 0,
          Funcionarios: data.total_by_cost_center.Funcionarios || 0,
          Operacional: data.total_by_cost_center.Operacional || 0,
        });
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
      } finally {
        setShowSpinner(false); 
      }
    };

    fetchData();
  }, []);

  return <CardsContainer cardValues={cardValues} showSpinner={showSpinner} />;
};

export default ParentComponent;

import React from 'react';

interface CardProps {
  titulo: string;
  additionalValue: number;
  icone: React.ReactNode;
  corTexto: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Card: React.FC<CardProps> = ({ titulo, additionalValue, icone, corTexto }) => {
  return (
    <div style={{ ...styles.card, color: corTexto }}>
      <div style={styles.icone}>{icone}</div>
      <h3 style={{ ...styles.titulo, color: corTexto }}>{titulo}</h3>
      <p style={styles.valor}>{isNaN(additionalValue) ? 'R$ 0,00' : formatCurrency(additionalValue)}</p>
    </div>
  );
};

export default Card;

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    flex: 1,
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  icone: {
    fontSize: '40px',
    marginBottom: '-5px',
  },
  titulo: {
    fontSize: '18px',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  valor: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'black',
  },
};

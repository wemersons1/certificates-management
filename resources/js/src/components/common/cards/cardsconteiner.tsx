import Card from './cardprops';
import Skeleton from 'react-loading-skeleton';

interface CardsContainerProps {
  cardValues: {
    Marketing: number;
    Vendas: number;
    Funcionarios: number;
    Operacional: number;
  };
  showSpinner: boolean;
}

const CardsContainer: React.FC<CardsContainerProps> = ({ cardValues, showSpinner }) => (
  <div style={styles.container}>
    {showSpinner ? (
      // Aqui, estamos exibindo o esqueleto dos cards quando showSpinner é verdadeiro
      <>
        <div style={styles.card}>
          <Skeleton width={40} height={40} />
          <h3 style={styles.titulo}>
            <Skeleton width={100} />
          </h3>
          <p style={styles.valor}>
            <Skeleton width={80} />
          </p>
        </div>
        <div style={styles.card}>
          <Skeleton width={40} height={40} />
          <h3 style={styles.titulo}>
            <Skeleton width={100} />
          </h3>
          <p style={styles.valor}>
            <Skeleton width={80} />
          </p>
        </div>
        <div style={styles.card}>
          <Skeleton width={40} height={40} />
          <h3 style={styles.titulo}>
            <Skeleton width={100} />
          </h3>
          <p style={styles.valor}>
            <Skeleton width={80} />
          </p>
        </div>
        <div style={styles.card}>
          <Skeleton width={40} height={40} />
          <h3 style={styles.titulo}>
            <Skeleton width={100} />
          </h3>
          <p style={styles.valor}>
            <Skeleton width={80} />
          </p>
        </div>
      </>
   ) : (
    <>
      <Card
        titulo="Marketing"
        additionalValue={cardValues.Marketing}
        icone={<i className="las la-bullhorn"></i>}
        corTexto="#8a2be2"
      />
      <Card
        titulo="Vendas"
        additionalValue={cardValues.Vendas}
        icone={<i className="las la-cart-arrow-down"></i>}
        corTexto="#8a2be2"
      />
      <Card
        titulo="Alunos"
        additionalValue={cardValues.Funcionarios}
        icone={<i className="las la-users"></i>}
        corTexto="#8a2be2"
      />
      <Card
        titulo="Operacional"
        additionalValue={cardValues.Operacional}
        icone={<i className="las la-dolly-flatbed"></i>}
        corTexto="#8a2be2"
      />
    </>
  )}
</div>
);

export default CardsContainer;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
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
    marginBottom: '0',
    fontWeight: 'bold',
  },
  valor: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'black',
  },
};

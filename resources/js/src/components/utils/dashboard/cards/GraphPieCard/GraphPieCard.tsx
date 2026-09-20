import { Card, CardHeader, CardBody } from 'react-bootstrap';
import DonutChart from '../../charts/DonutChart/DonutChart';
import PieChart from '../../charts/PieChart/PieChart';

interface GraphPieCardProps {
  title: string;
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  valueFormatter?: (value: number) => string; // Função para formatação customizável do valor
}

const GraphPieCard: React.FC<GraphPieCardProps> = ({ title, data, valueFormatter }) => {
  const total = data.values.reduce((a, b) => a + b, 0);

  return (
    <Card className="custom-card" style={{ borderRadius: '12px', height: '300px'}}>
      <CardHeader>
        <Card.Title>{title}</Card.Title>
      </CardHeader>
      <CardBody className='d-flex justify-content-center align-items-center'>
        <div className='d-flex justify-content-center'style={{height:"120%"}}>
          <PieChart
            labels={data.labels}
            values={data.values}
            colors={data.colors}
            height={"100%"}
            tooltipFormatter = {valueFormatter}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default GraphPieCard;

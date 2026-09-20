import { Card, CardHeader, CardBody } from 'react-bootstrap';
import DonutChart from '../../charts/DonutChart/DonutChart';
import DonutChartMarketing from '../../charts/DonutChart/DonutChartMarketing';

interface MarketingGraphCardProps {
  title: string;
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  valueFormatter?: (value: number) => string; // Função para formatação customizável do valor
}

const MarketingGraphCard: React.FC<MarketingGraphCardProps> = ({ title, data, valueFormatter }) => {
  const total = data.values.reduce((a, b) => a + b, 0);

  return (
    <Card className="custom-card" style={{ borderRadius: '12px', height: '407px' }}>
      <CardHeader>
        <Card.Title>{title}</Card.Title>
      </CardHeader>
      <CardBody>
        <div className='d-flex justify-content-center'>
          <DonutChartMarketing
            labels={data.labels}
            values={data.values}
            colors={data.colors}
            width={"60%"}
            showTotal={true}
            centerText="Investidos"
            valueFormatter={valueFormatter}
          />
        </div>

        <div style={{ marginTop: '6%' }}>
          {data.labels.map((label, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: data.colors ? data.colors[index] : '#000',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '10px'
                }}></span>
                <span className='text-muted'>{label}</span>
              </div>
              <div style={{ width: '20%', textAlign: 'center' }} className='text-muted'>
                {`${((data.values[index] / total) * 100).toFixed(1)}%`}
              </div>
              <div style={{ width: '40%', textAlign: 'right' }} className='text-muted'>
                {valueFormatter ? valueFormatter(data.values[index]) : data.values[index]}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default MarketingGraphCard;

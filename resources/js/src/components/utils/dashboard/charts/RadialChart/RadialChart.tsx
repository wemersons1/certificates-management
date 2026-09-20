import React from 'react';
import Chart from 'react-apexcharts';

interface RadialChartProps {
  subtitle: string;
  percentage: number;
  units: number;
  color: string;
}

const RadialChart: React.FC<RadialChartProps> = ({ subtitle, percentage, units, color }) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '65%',
        },
        track: {
          background: '#f2f2f2',
        },
        dataLabels: {
          show: false, // Desabilita os rótulos padrão
        },
      },
    },
    colors: [color],
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <Chart options={options} series={[percentage]} type="radialBar" height={200} />
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#333',
        }}>
            <div className="fs-12 text-muted">{subtitle}</div>
            <div className="fs-18 text-dark fw-bold">{(percentage).toFixed(2)}%</div>
            <div className="fs-12 text-muted">{units} unidades</div>
        </div>
        </div>
    </div>
  );
};

export default RadialChart;

import React from 'react';
import Chart from 'react-apexcharts';

interface PieChartProps {
  labels: string[];
  values: number[];
  colors?: string[]; // Cores passadas por props
  height?: string | number; // Largura configurável
  tooltipFormatter?: (value: number, total: number) => string;
}

const PieChart: React.FC<PieChartProps> = ({
  labels,
  values,
  colors,
  height = "100%",
  tooltipFormatter = (value, total) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${value} (${percentage}%)`;
  }
}) => {
  const total = values.reduce((a, b) => a + b, 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie' as const, // Alterado de "donut" para "pie"
    },
    labels: labels,
    colors: colors,
    legend: {
      show: true, // Habilita a legenda padrão do gráfico
      position: 'bottom', // Posiciona a legenda abaixo do gráfico
    },
    stroke: {
      show: false // Remove as linhas brancas de separação entre as fatias
    },
    dataLabels: {
      enabled: false, // Habilita a exibição de rótulos diretamente no gráfico
    },
    tooltip: {
      enabled: true, // Habilita o tooltip
      y: {
        formatter: (value: number) => tooltipFormatter(value, total)
      }
    }
  };

  return (
    <div style={{ position: 'relative'
     }}>
      <Chart options={options} series={values} type="pie" width="100%" />
    </div>
  );
};

export default PieChart;

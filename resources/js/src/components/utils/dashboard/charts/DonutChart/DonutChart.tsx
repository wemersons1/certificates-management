import React from 'react';
import Chart from 'react-apexcharts';
import { isDarkColor } from '@/src/lib/helper';

interface DonutChartProps {
  labels: string[];
  values: number[];
  colors?: string[]; // Cores passadas por props
  width?: string | number; // Largura configurável
  donutSize?: string; // Tamanho do donut configurável
  tooltipFormatter?: (value: number, total: number) => string;
  showTotal?: boolean; // Exibir o total no centro quando true
  centerText?: string; // Texto a ser exibido no centro, ex: "Investidos"
  valueFormatter?: (value: number) => string; // Função para formatar o valor central
}

const DonutChart: React.FC<DonutChartProps> = ({
  labels,
  values,
  colors = ["#f0a500", "#2a9d8f", "#f4a261", "#e76f51", "#ef476f", "#06d6a0"],
  width = "100%",
  donutSize = '65%',
  tooltipFormatter = (value, total) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${value} (${percentage}%)`;
  },
  showTotal = false, // Controle para exibir o total no centro
  centerText = 'Total', // Texto padrão para o centro
  valueFormatter = (value) => value.toLocaleString() // Formatação padrão como número normal
}) => {
  const total = values.reduce((a, b) => a + b, 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut' as const,
    },
    labels: labels,
    colors: colors,
    legend: {
      show: false, // Esconde a legenda padrão do gráfico
    },
    plotOptions: {
      pie: {
        donut: {
          size: donutSize // Define o tamanho do centro da rosca
        }
      }
    },
    stroke: {
      show: false // Remove as linhas brancas de separação entre as fatias
    },
    dataLabels: {
      enabled: false // Desativa a exibição de rótulos diretamente no gráfico
    },
    tooltip: {
      enabled: true, // Habilita o tooltip
      y: {
        formatter: (value: number) => tooltipFormatter(value, total)
      },
      custom: ({ series, seriesIndex, w }) => {
        const label = w.config.labels[seriesIndex]; // Obtém o rótulo atual
        const value = series[seriesIndex];
        const total = series.reduce((a, b) => a + b, 0); // Calcula o total
        const percentage = ((value / total) * 100).toFixed(1);
  
        // Determina a cor de fundo e ajusta o texto com base na luminosidade
        const backgroundColor = colors[seriesIndex];
        const textColor = isDarkColor(backgroundColor) ? "#FFFFFF" : "#000000";
  
        // Retorna o tooltip customizado com a cor ajustada
        return `
          <div style="padding: 4px; background: ${backgroundColor}; color: ${textColor}; border-radius: 4px; text-align: center; font-size: 14px">
            <span>${label}: ${value} (${percentage}%)</span>
          </div>
        `;
      },
    }
  };

  return (
    <div style={{ position: 'relative', width: width }}>
      <Chart options={options} series={values} type="donut" width="100%" />
      {showTotal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <h3 className='fs-17'>{valueFormatter(total)}</h3>
          <span className='text-muted'>{centerText}</span>
        </div>
      )}
    </div>
  );
};

export default DonutChart;

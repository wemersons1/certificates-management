import React from 'react';
import Chart from 'react-apexcharts';

interface BarChartProps {
  categories: string[];  // Datas no formato 'yyyy-mm-dd'
  seriesData: Array<{ name: string; data: number[]}>;
  height?: number;
  stacked?: boolean;
  yAxisFormat?: 'currency' | 'percent' | 'number';
  colors?: string[];
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipFormat?: (value: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  categories, 
  seriesData, 
  height = 300, 
  stacked = false,
  yAxisFormat = 'number',
  colors = [], 
  legendPosition = 'top',
  tooltipFormat,
}) => {
  const formatYAxisLabels = (value: number) => {
    switch (yAxisFormat) {
      case 'currency':
        return `R$ ${value.toFixed(2)}`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  // Formata as datas para o formato dd/mm
  const formattedCategories = categories.map(date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}`;
  });

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar' as const,
      stacked: stacked,
      toolbar: {
        show: false
      }
    },
    colors: colors,
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: formattedCategories, // Usa as datas formatadas
      labels: {
        show: true,
      },
    },
    yaxis: {
      labels: {
        show: true,
        formatter: formatYAxisLabels
      }
    },
    legend: {
      position: legendPosition
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: tooltipFormat || undefined
      }
    }
  };

  return <Chart options={options} series={seriesData} type="bar" height={height}/>;
};

export default BarChart;

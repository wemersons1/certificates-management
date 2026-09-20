import { ApexOptions } from "apexcharts";
import { Component } from "react";
import ReactApexChart from "react-apexcharts";

interface spark3 {
    options?: ApexOptions,
    width?: string | number,
    height?: string | number,
    series?: ApexOptions['series'],
    label?: XAxisAnnotations
    endingShape?: string
    color?: string | string[] | undefined;
}

export class Salesstatistics extends Component<{}, spark3> {
    constructor(props: {} | Readonly<{}>) {
        super(props);

        this.state = {
            series: [{
                name: "Income",
                data: [66, 85, 50, 105, 65, 74, 70, 105, 100, 125, 85, 110, 85, 58, 112],
                type: "bar",
            }, {
                name: "Profit",
                data: [65, 20, 40, 55, 80, 90, 59, 86, 120, 165, 115, 120, 50, 70, 85],
                type: "line",
            }, {
                name: "Sales",
                data: [20, 65, 85, 38, 55, 25, 25, 165, 75, 64, 70, 75, 85, 85, 115],
                type: "line",
            }],
            options: {
                chart: {
                    events: {
                        mounted: (chart) => {
                            chart.windowResizeHandler();
                        }
                    },
                    height: 300,
                    toolbar: {
                        show: false
                    },
                    dropShadow: {
                        enabled: true,
                        enabledOnSeries: undefined,
                        top: 5,
                        left: 0,
                        blur: 3,
                        color: "var(--primary02)",
                        opacity: 0.5
                    },
                },
                grid: {
                    show: true,
                    borderColor: "rgba(119, 119, 142, 0.1)",
                    strokeDashArray: 4,
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [0, 2.5, 2.5],
                    curve: "smooth",
                },
                legend: {
                    show: true,
                    position: "top",
                    horizontalAlign: "center",
                    fontWeight: 600,
                    fontSize: "11px",
                    tooltipHoverFormatter: function (val, opts) {
                        return val + " - " + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + "";
                    },
                    labels: {
                        colors: "#74767c",
                    },
                    markers: {
                        strokeWidth: 0,
                        offsetX: 0,
                        offsetY: 0
                    },
                },
                series: [{
                    name: "Income",
                    data: [66, 85, 50, 105, 65, 74, 70, 105, 100, 125, 85, 110, 85, 58, 112],
                    type: "bar",
                }, {
                    name: "Profit",
                    data: [65, 20, 40, 55, 80, 90, 59, 86, 120, 165, 115, 120, 50, 70, 85],
                    type: "line",
                }, {
                    name: "Sales",
                    data: [20, 65, 85, 38, 55, 25, 25, 165, 75, 64, 70, 75, 85, 85, 115],
                    type: "line",
                }],
                colors: ["rgba(119, 119, 142, 0.075)", "#8e54e9", "rgba(245 ,187 ,116)",],
                fill: {
                    type: ["solid", "gradient", "gradient"],
                    gradient: {
                        gradientToColors: ["transparent", "#4776E6", "#f5bb74"]
                    },
                },
                yaxis: {
                    title: {
                        style: {
                            color: "#adb5be",
                            fontSize: "14px",
                            fontFamily: "poppins, sans-serif",
                            fontWeight: 600,
                            cssClass: "apexcharts-yaxis-label",
                        },
                    },
                    labels: {
                        formatter: function (y) {
                            return y.toFixed(0) + "";
                        },
                        show: true,
                        style: {
                            colors: "#8c9097",
                            fontSize: "11px",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-label",
                        },
                    }
                },
                xaxis: {
                    type: "category",
                    categories: ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "07 Jan", "08 Jan", "09 Jan",
                        "10 Jan", "11 Jan", "12 Jan", "13 Jan", "14 Jan", "15 Jan"
                    ],
                    axisBorder: {
                        show: true,
                        color: "rgba(119, 119, 142, 0.05)",
                        offsetX: 0,
                        offsetY: 0,
                    },
                    axisTicks: {
                        show: true,
                        borderType: "solid",
                        color: "rgba(119, 119, 142, 0.05)",
                        // width: 6,
                        offsetX: 0,
                        offsetY: 0
                    },
                    labels: {
                        rotate: -90,
                        style: {
                            colors: "#8c9097",
                            fontSize: "11px",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-label",
                        },
                    }
                },

            }

        };
    }

    render() {
        return (
            <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={300} />

        );
    }
}
//
export class Salesvalue extends Component<{}, spark3> {
    constructor(props: {} | Readonly<{}>) {
        super(props);

        this.state = {
            series: [70],
            options: {
                chart: {
                    height: 295,
                    type: "radialBar",
                    events: {
                        mounted: (chart) => {
                            chart.windowResizeHandler();
                        }
                    },
                },
                colors: ["#8e54e9"],
                plotOptions: {
                    radialBar: {
                        hollow: {
                            size: "65%",
                        },
                    },
                },
                labels: ["Total Sales"],

            }

        };
    }

    render() {
        return (
            <ReactApexChart options={this.state.options} series={this.state.series} type="radialBar" height={300} />

        );
    }
}

interface cardsdata {
    id:string;
    title:string;
    text1:string;
    text2:string;
    icon1:string;
    icon2:string;
    color1:string;
    color2:string;
}
export const Cardsdata:cardsdata[] = [
    { id: "1", title: "Total Sales", text1: "$18,645", text2: "+24%", icon1: "bi bi-cart-check fs-20", icon2: "down", color1: "primary", color2: "primary" },
    { id: "2", title: "Total Revenue", text1: "$34,876", text2: "+0.26%", icon1: "bi bi-archive fs-20", icon2: "down", color1: "secondary", color2: "success" },
    { id: "3", title: "Total Products", text1: "26,231", text2: "+06%", icon1: "bi bi-handbag fs-20", icon2: "down", color1: "info", color2: "danger" },
    { id: "4", title: "Total Expenses", text1: "$73,579", text2: "+06%", icon1: "bi bi-currency-dollar fs-20", icon2: "up", color1: "warning", color2: "success" },
    { id: "5", title: "Active Subscribers", text1: "1,468", text2: "+16% ", icon1: "bi bi-bell fs-20", icon2: "down", color1: "danger", color2: "danger" },
];

//Monthly profit
export class Monthlyprofit extends Component<{}, spark3> {
    constructor(props: {} | Readonly<{}>) {
        super(props);

        this.state = {
            series: [
                {
                    name: "Value",
                    data: [2, 10, 8, 17, 13, 10, 16, 10, 15],
                },
            ],
            options: {
                chart: {
                    type: "line",
                    height: 50,
                    width: 150,
                    sparkline: {
                        enabled: true,
                    },
                    events: {
                        mounted: (chart) => {
                            chart.windowResizeHandler();
                        }
                    },
                },
                stroke: {
                    show: true,
                    curve: "smooth",
                    lineCap: "butt",
                    colors: undefined,
                    width: 2,
                    dashArray: 0,
                },

                yaxis: {
                    min: 0,
                    show: false,
                    axisBorder: {
                        show: false,
                    },
                },
                xaxis: {
                    // show: false,
                    axisBorder: {
                        show: false,
                    },
                },
                tooltip: {
                    enabled: true,
                },
                colors: ["#8e54e9"]

            }

        };
    }

    render() {
        return (
            <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={50} width={130} />

        );
    }
}

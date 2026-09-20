import React, { FC} from "react";
import { Card, Row, Col} from "react-bootstrap";
import { BsCurrencyDollar, BsCurrencyEuro, BsCurrencyBitcoin } from 'react-icons/bs';
import { Line } from "react-chartjs-2";
import { FaEthereum } from 'react-icons/fa';

interface CurrencyData {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    data: number[];
    }


interface InfoCardsProps {
    currencies: CurrencyData[];
    }



    const InfoCards: FC<InfoCardsProps> = ({ currencies }) => (
        
      <Row className="g-1"> {/* Espaçamento entre linhas e colunas */}
          <Col xs={12} lg={11}>
              <Row>
                  {currencies.slice(0, 2).map((currency, index) => (
                      <Col xs={6} key={index}> {/* Primeira linha de 2 cards */}
                          <Card className="shadow-sm rounded border-0" style={{ height: "160px", padding: "0.5rem" }}>
                              <Card.Body className="d-flex flex-column align-items-center text-center p-1">
                                  <div className="d-flex align-items-center mb-1">
                                      {currency.label === "Dólar" && (
                                    <span className="avatar avatar-md avatar-rounded bg-light p-2">
                                     <BsCurrencyDollar size={20} className="mr-1" color="green"/>
                                      </span>
                        
                                      )}
                                      {currency.label === "Euro" && (
                                        
                                    <span className="avatar avatar-md avatar-rounded bg-light p-2">
                                          <BsCurrencyEuro size={20} className="mr-1" color="black"/>
                                          </span>
                                      )}
                                      <Card.Title
                                          className="mb-0 text-dark"
                                          style={{ fontSize: "1.3rem" }}
                                      >
                                          {currency.label}
                                      </Card.Title>
                                  </div>
                                  <Card.Text
                                      className="mb-1 text-dark font-weight-bold"
                                      style={{ fontSize: "1.3rem" }}
                                  >
                                      {currency.value}
                                  </Card.Text>
                                  <span
                                    className={`ms-1 badge ${
                                        currency.positive ? "bg-success-transparent" : "bg-danger-transparent"
                                    } badge-sm rounded-pill`}
                                >
                                    {currency.change} {currency.positive ? "▲" : "▼"}
                                </span>

                                <Line
                                data={{
                                    labels: Array(7).fill(""),
                                    datasets: [
                                        {
                                            label: "Valor",
                                            data: currency.data,
                                            borderColor: currency.positive ? "green" : "red",
                                            backgroundColor:
                                                currency.label === "Dólar" ? "#4CAF50" : "#2196F3",
                                            fill: false,
                                            tension: 0.4,
                                            pointRadius: 0,  
                                        },
                                    ],
                                }}
                                options={{
                                    scales: { x: { display: false }, y: { display: false } },
                                    plugins: { legend: { display: false } },
                                    elements: { 
                                        line: { borderWidth: 1.5 },
                                        point: { radius: 0 },  
                                    },
                                }}
                                height={20}
                            />

                              </Card.Body>
                          </Card>
                      </Col>
                  ))}
              </Row>
              <Row>
                  {currencies.slice(2, 4).map((currency, index) => (
                      <Col xs={6} key={index}> {/* Segunda linha de 2 cards */}
                          <Card className="p-2 shadow-sm rounded border-0" style={{ height: "140px" }}>
                              <Card.Body className="d-flex flex-column align-items-center text-center p-1">
                                  <div className="d-flex align-items-center mb-1">
                                      {currency.label === "Bitcoin" && (
                                        <span className="avatar avatar-md avatar-rounded bg-light p-2">
                                          <BsCurrencyBitcoin size={20} className="mr-1"  color="orange"/>
                                          
                                          </span>
                                      )}
                                      {currency.label === "Ethereum" && (
                                        									<span className="avatar avatar-md avatar-rounded bg-light p-2">
                                                                            <FaEthereum size={20} className="mr-1" color="blue" />
                                                                        </span> 
                                      )}
                                      <Card.Title
                                          className="mb-0 text-dark"
                                          style={{ fontSize: "1.2rem" }}
                                      >
                                          {currency.label}
                                      </Card.Title>
                                  </div>
                                  <Card.Text
                                      className="mb-1 text-dark font-weight-bold"
                                      style={{ fontSize: "1.3rem" }}
                                  >
                                      {currency.value}
                                  </Card.Text>
                                  <span
                                        className={`ms-1 badge ${
                                            currency.positive ? "bg-success-transparent" : "bg-danger-transparent"
                                        } badge-sm rounded-pill`}
                                    >
                                        {currency.change} {currency.positive ? "▲" : "▼"}
                                    </span>

                                    <Line
                                        data={{
                                            labels: Array(7).fill(""),
                                            datasets: [
                                                {
                                                    label: "Valor",
                                                    data: currency.data,
                                                    borderColor: currency.positive ? "green" : "red",
                                                    backgroundColor:
                                                        currency.label === "Bitcoin" ? "#673AB7" : "#FF9800",
                                                    fill: false,
                                                    tension: 0.4,
                                                    pointRadius: 0,  // Remove os pontos nas extremidades
                                                },
                                            ],
                                        }}
                                        options={{
                                            scales: { x: { display: false }, y: { display: false } },
                                            plugins: { legend: { display: false } },
                                            elements: { 
                                                line: { borderWidth: 1.5 },
                                                point: { radius: 0 },  // Garantir que os pontos do gráfico não apareçam
                                            },
                                        }}
                                        height={20}
                                    />

                              </Card.Body>
                          </Card>
                      </Col>
                  ))}
              </Row>
          </Col>
      </Row>
  );

  export default InfoCards;
  

import React, { FC,useState } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import img from '../../../assets/images/authentication/login-cover.png'
import { Card,Button } from "react-bootstrap";

const TipsCard: FC = () => {
    const tips = [
        "Pesquise Fornecedores Locais: Trabalhar com fornecedores locais pode reduzir custos de envio e tempos de entrega. Muitas empresas na LATAM oferecem estoques locais que ajudam a agilizar a entrega ao cliente.",
        "Entenda a Logística de Cada País: Cada país da LATAM tem suas particularidades para envios internacionais, taxas de importação e alfândega. Conheça as exigências para evitar atrasos e taxas inesperados.",
    ];

    const [currentTip, setCurrentTip] = useState(0);

    const nextTip = () => {
        setCurrentTip((prevTip) => (prevTip + 1) % tips.length);
    };

    const prevTip = () => {
        setCurrentTip((prevTip) => (prevTip - 1 + tips.length) % tips.length);
    };

    return (
<Card
    className="p-4 shadow rounded-lg" 
    style={{
        backgroundImage: `url(${img})`,
        margin: "0", 
        padding: "0", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        height: "325px",
        borderRadius: "15px",
        position: "relative",
        overflow: "hidden",
    }}
>
            {}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", 
                    borderRadius: "15px",
                    zIndex: 1,
                }}
            ></div>

            <div style={{ position: "relative", zIndex: 2 }}>
                <Card.Title className="mb-3" style={{ fontSize: "1.5rem", fontWeight: "bold", color:"white"}}>
                    Dicas
                </Card.Title>
                <Card.Text style={{ fontSize: "1rem", lineHeight: "1.5" }}>
                    {tips[currentTip]}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button
                        variant="link"
                        className="text-white p-0"
                        onClick={prevTip}
                        style={{ fontSize: "1.2rem" }}
                    >
                        <FaChevronLeft />
                    </Button>

                    <Button
                        variant="link"
                        className="text-white p-0"
                        onClick={nextTip}
                        style={{ fontSize: "1.2rem" }}
                    >
                        <FaChevronRight />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TipsCard;
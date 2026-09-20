import { FC, useEffect, useState } from "react";
import InputMask from "react-input-mask";

interface PredictedDeliveryRateCardProps {
    averageDeliveryRate: number;
    canceledRate: number;
    devolutionRate: number;
    deliveryRate: number;
    onSave: (newRate: number) => void;
}

const PredictedDeliveryRateCard: FC<PredictedDeliveryRateCardProps> = ({ averageDeliveryRate, onSave, canceledRate, devolutionRate, deliveryRate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedRate, setEditedRate] = useState<string>("00.00");

    useEffect(() => {
        setEditedRate(averageDeliveryRate.toFixed(2).padStart(5, "0"));
    }, [averageDeliveryRate]);

    const handleEditClick = () => setIsEditing(true);

    const handleSave = () => {
        const numericRate = parseFloat(editedRate);
        const maxRate = 100 - canceledRate - devolutionRate;
        const minRate = deliveryRate;

        const adjustedRate = Math.max(minRate, Math.min(numericRate, maxRate));

        setEditedRate(adjustedRate.toFixed(2));
        onSave(adjustedRate);

        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedRate(averageDeliveryRate.toFixed(2).padStart(5, "0"));
        setIsEditing(false);
    };

    let deliveryRateColor = "";

    if (averageDeliveryRate >= 50) {
        deliveryRateColor = "rgb(5, 175, 110)";
    } else if (averageDeliveryRate >= 40) {
        deliveryRateColor = "rgb(233, 160, 25)";
    } else {
        deliveryRateColor = "rgb(230,83,60)";
    }

    return (
        <div
            className="custom-card d-flex me-4"
            style={{
                backgroundColor: "#e5dafe",
                padding: "4px 12px",
                borderRadius: "8px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <div className="me-2 d-flex align-items-center">
                <span className="text-primary">Taxa de entrega prevista:</span>
            </div>
            <div className="d-flex align-items-center">
                {isEditing ? (
                    <>
                        <InputMask
                            mask="99.99%"
                            value={editedRate}
                            onChange={(e) => setEditedRate(e.target.value.replace("%", ""))}
                            className="form-control"
                            style={{
                                width: "80px",
                                height: "25px",
                                textAlign: "center",
                                fontSize: "14px",
                            }}
                        />
                        <i
                            className="las la-check text-success"
                            style={{ cursor: "pointer", fontSize: "18px", marginLeft: "8px" }}
                            onClick={handleSave}
                        ></i>
                        <i
                            className="las la-times text-danger"
                            style={{ cursor: "pointer", fontSize: "18px", marginLeft: "8px" }}
                            onClick={handleCancel}
                        ></i>
                    </>
                ) : (
                    <>
                        <span style={{ color: deliveryRateColor, fontWeight: "bold" }}>
                            {averageDeliveryRate.toFixed(2)}%
                        </span>
                        <i
                            className="las la-edit text-primary"
                            style={{ cursor: "pointer", fontSize: "18px", marginLeft: "8px" }}
                            onClick={handleEditClick}
                        ></i>
                    </>
                )}
            </div>
        </div>
    );
};

export default PredictedDeliveryRateCard;

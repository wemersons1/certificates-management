import { FC } from "react";
import { Form } from "react-bootstrap";

interface ItemsPerPageSelectorProps {
    perPage: number;
    onChange: (perPage: number) => void;
    options?: number[]; 
}

const ItemsPerPageSelector: FC<ItemsPerPageSelectorProps> = ({ perPage, onChange, options = [10, 15, 25, 50] }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(Number(e.target.value));
    };

    return (
        <div className="d-flex align-items-center">
            <span className="text-muted me-2">Exibir</span>
            <Form.Select className="text-muted"
                value={perPage}
                onChange={handleChange}
                style={{ width: "70px", padding: "4px" }}
                size="sm"
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};

export default ItemsPerPageSelector;

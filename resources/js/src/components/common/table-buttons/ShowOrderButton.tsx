import { FC } from "react";
import styles from "./IconButtons.module.css";

interface ShowOrderButtonProps {
    onClick: () => void;
}

const ShowOrderButton: FC<ShowOrderButtonProps> = ({ onClick }) => {
    return (
        <button className={`${styles.showOrderButton}`} onClick={onClick}>
            <i className={`bi bi-eye ${styles.icon}`}></i>
        </button>
    );
};

export default ShowOrderButton;

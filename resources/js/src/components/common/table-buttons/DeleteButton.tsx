import { FC } from "react";
import styles from "./IconButtons.module.css";

interface DeleteButtonProps {
    onClick: () => void;
}

const DeleteButton: FC<DeleteButtonProps> = ({ onClick }) => {
    return (
        <button className={`${styles.deleteButton}`} onClick={onClick}>
            <i className={`las la-trash ${styles.icon}`}></i>
        </button>
    );
};

export default DeleteButton;

import { FC } from "react";
import styles from "./IconButtons.module.css";

interface EditButtonProps {
    onClick: () => void;
}

const EditButton: FC<EditButtonProps> = ({ onClick }) => {
    return (
        <button className={`${styles.editButton}`} onClick={onClick}>
            <i className={`las la-edit ${styles.icon}`}></i>
        </button>
    );
};

export default EditButton;

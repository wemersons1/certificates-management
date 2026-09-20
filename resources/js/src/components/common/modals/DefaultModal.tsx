import { FC, ReactNode } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface DefaultModalProps {
    show: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isSubmitting?: boolean;
    submitButtonText?: string;
}

const DefaultModal: FC<DefaultModalProps> = ({
    show,
    title,
    children,
    onClose,
    onSubmit,
    isSubmitting = false,
    submitButtonText = "Salvar"
}) => {
    const iconPlus = <i className="las la-plus me-1"></i>;

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title className="h5 fs-18">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    {children}
                    <Modal.Footer>
                        <Button variant="outline-primary" onClick={onClose}>
                            Fechar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {iconPlus}
                            {isSubmitting ? "Salvando..." : submitButtonText}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default DefaultModal;

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import api from '@/src/lib/api';
import If from '@/src/components/common/if/if';
import { firstLetterUppercase } from '@/src/lib/helper';
import Swal from 'sweetalert2';

const ImportModal = ({ show, type, onClose, setShow }: { show: boolean; type: string; getCompanies: boolean; setShow: Dispatch<SetStateAction<boolean>>; setGetcompanies: Dispatch<SetStateAction<boolean>>; onClose: () => void }) => {
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const handleImport = async () => {
        if (!files.length) return;

        const formData = new FormData();
        formData.append('file', files[0].file);

        try {
            setUploading(true);
            let apiUrl = '/companies/import/';

            if (type === 'alunos') {
                apiUrl = '/employees/import/';
            }

            const response = await api.post(apiUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response?.data) {
                setShow(false);
                setUploading(false);
                Swal.fire({
                    icon: "success",
                    title: 'Sucesso',
                    text: "Sua solicitação está sendo processada, dentro de alguns instantes será concluída",
                    showDenyButton: false,
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                });
            }

        } catch (e) {
            console.error(e);
        }
    };

    const handleDownloadExample = () => {
        let headers = '';
        let fileName = '';

        if (type === 'empresas') {
            const headerLine = 'RAZAOSOCIAL,CNPJ,EMAIL_EMPRESA';
            const requiredLine = '(OBRIGATÓRIO),(OBRIGATÓRIO),';
            headers = `${headerLine}\n${requiredLine}`;
            fileName = 'layout_empresas.csv';
        } else if (type === 'alunos') {
            const headerLine = 'CNPJ_EMPRESA,NOME,CPF,RG,UFRG,EMAIL,CELULAR,FUNCAO,MAQUINAS_OPERADAS';
            const requiredLine = '(OBRIGATÓRIO),(OBRIGATÓRIO),(OPCIONAL),(OPCIONAL),(OPCIONAL),,,,';
            headers = `${headerLine}\n${requiredLine}`;
            fileName = 'layout_alunos.csv';
        }

        if (headers) {
            const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }
    };

    return (
        <Modal show={show} onHide={onClose} backdrop="static" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{`Importar ${firstLetterUppercase(type)}`}</Modal.Title>
            </Modal.Header>
  
            <Modal.Body>
                <p>
                    <b>Baixe o layout de exemplo, clicando </b>
                    <b
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={handleDownloadExample}
                    >
                        aqui
                    </b>
                </p>
                <Form>
                    <If condition={!!type.length}>
                        <div className="mb-3">
                            <FilePond
                                files={files}
                                allowMultiple={false}
                                onupdatefiles={setFiles}
                                labelIdle='Arraste e solte o arquivo CSV ou <span class="filepond--label-action">clique aqui</span>'
                            />
                        </div>
                    </If>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={uploading}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleImport} disabled={!files.length || uploading}>
                    {(uploading ? <Spinner size="sm" animation="border" /> : 'Importar')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ImportModal;
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '@/src/lib/api';
import { clearMask } from '@/src/lib/helper';

interface CompleteRegistrationModalProps {
    user: any;
    onUpdated: (user: any) => void;
}

const CompleteRegistrationModal = ({ user, onUpdated }: CompleteRegistrationModalProps) => {
    const [termsContent, setTermsContent] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [segmentsOptions, setSegmentsOptions] = useState<any[]>([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);

        if (digits.length <= 2) {
            return digits;
        }

        if (digits.length <= 6) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        }

        if (digits.length <= 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }

        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const formatCNPJ = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
        if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    };

    const needsCompletion = useMemo(() => {
        const isEntity = user?.role?.name === 'Entity';
        const userPhone = typeof user?.phone === 'string' ? user.phone.trim() : '';
        const missingPhone = !userPhone;
        const missingBusinessSegment = !user?.entity?.business_segment_id;
        const notCompleted = !user?.entity?.registration_completed;

        return Boolean(user?.id && isEntity && (notCompleted || missingPhone || missingBusinessSegment));
    }, [user]);

    useEffect(() => {
        if (!needsCompletion) return;

        setPhone(user?.phone ?? '');
        setName(user?.entity?.name ?? '');
        setCnpj(user?.entity?.cnpj ?? '');
        setSelectedSegmentId(user?.entity?.business_segment_id ? String(user.entity.business_segment_id) : '');
        setAcceptedTerms(false);

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const setupResponse = await api.get('/setup');
                setTermsContent(setupResponse?.data?.term_and_condition?.content ?? '');

                const segmentsResponse = await api.get('/business-segments?all=1');
                setSegmentsOptions(segmentsResponse?.data ?? []);
            } catch (error) {
                toast.error('Não foi possível carregar os dados para completar cadastro.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [needsCompletion, user]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!acceptedTerms) {
            toast.error('Você precisa aceitar os termos para continuar.');
            return;
        }

        if (!selectedSegmentId) {
            toast.error('Você precisa selecionar o seu ramo de atuação / segmento.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/users/complete-registration', {
                phone: clearMask(phone),
                name: name,
                cnpj: clearMask(cnpj),
                business_segment_id: Number(selectedSegmentId),
            });

            const updatedUser = response?.data?.user;
            if (!updatedUser) {
                throw new Error('Usuário não retornado na atualização.');
            }

            // Atualiza o usuário no contexto
            onUpdated(updatedUser);
            toast.success('Cadastro completado com sucesso!');
            
            // Força um refresh da página para recalcular needsCompletion corretamente
            // e permitir que o WelcomeAssistant seja exibido
            window.location.reload();
        } catch (error) {
            toast.error('Erro ao completar cadastro. Verifique os dados e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Modal
                show={needsCompletion}
                backdrop="static"
                keyboard={false}
                centered
                contentClassName="border-0 shadow"
            >
                <Modal.Header className="border-0 pb-2">
                    <Modal.Title className="w-100 text-center fw-semibold">
                        Complete seu cadastro
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-2 px-4 pb-4">
                    <div className="mb-3 text-center text-muted" style={{ fontSize: '0.95rem' }}>
                        Precisamos de algumas informações para finalizar seu primeiro acesso.
                    </div>

                    {loadingData ? (
                        <div className="d-flex justify-content-center py-4">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="completeRegistrationPhone">
                                <Form.Label>Celular</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="(XX) XXXXX-XXXX"
                                    value={phone}
                                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                                    inputMode="numeric"
                                    maxLength={15}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="completeRegistrationName">
                                <Form.Label>Nome fantasia (Obrigatório)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: Minha Empresa LTDA"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="completeRegistrationCNPJ">
                                <Form.Label>CNPJ (Opcional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(event) => setCnpj(formatCNPJ(event.target.value))}
                                    inputMode="numeric"
                                    maxLength={18}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="completeRegistrationSegment">
                                <Form.Label>Ramo de Atuação / Segmento (Obrigatório)</Form.Label>
                                <Form.Select
                                    value={selectedSegmentId}
                                    onChange={(event) => setSelectedSegmentId(event.target.value)}
                                    required
                                >
                                    <option value="">Selecione seu segmento...</option>
                                    {segmentsOptions.map((seg: any) => (
                                        <option key={seg.id} value={seg.id}>
                                            {seg.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="completeRegistrationTerms">
                                <Form.Check
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                                    label={
                                        <span>
                                            Aceito os{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 align-baseline"
                                                onClick={() => setShowTerms(true)}
                                            >
                                                Termos e Condições
                                            </button>
                                        </span>
                                    }
                                    required
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100"
                                disabled={submitting || loadingData}
                                style={{ borderRadius: '10px' }}
                            >
                                {submitting ? 'Salvando...' : 'Finalizar cadastro'}
                            </Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                show={showTerms}
                onHide={() => setShowTerms(false)}
                centered
                size="lg"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>Termos e Condições</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: termsContent || 'Termos e condições não disponíveis no momento.',
                        }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default CompleteRegistrationModal;
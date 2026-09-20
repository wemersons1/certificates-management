import AppContext from '@/src/AppContext/Context';
import api from '@/src/lib/api';
import { FC, Fragment, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import If from '@/src/components/common/if/if';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { translateMessageError } from '@/src/lib/credit-card-helper';
import { Badge } from 'react-bootstrap';
import { changePointToComma, firstLetterUppercase } from '@/src/lib/helper';
// Declare MercadoPago globally if it's loaded via a script tag
declare const MercadoPago: any;

interface Plan {
    id: string;
    name: string;
    monthly_value: number;
    annual_value: number;
    image: string;
    benefits: Array<{ id: string; name: string }>; // Assuming benefits are objects with id and name
    latest_version: {
        id: string;
        name: string;
        monthly_value: number;
        annual_value: number;
        image: string;
        benefits: Array<{ id: string; name: string }>;
        quantity_certificates: number;
    };
}

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price: number;
    validity_days: number;
}

interface CheckoutScreenProps { };

const CheckoutScreen: FC<CheckoutScreenProps> = () => {
    const { user, setUserLogged, userIsBlock, checkRole } = useContext(AppContext);
    const navigate = useNavigate();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [periodicity, setPeriodicity] = useState<'monthly' | 'annual' | 'credits'>('monthly');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);

    // Credit packages state
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
    const [pixSuccess, setPixSuccess] = useState(false);

    const [qrCode, setQrCode] = useState<string | null>(null); // For PIX QR Code
    const [pixCopyPasteCode, setPixCopyPasteCode] = useState<string | null>(null); // For PIX "Copia e Cola" code
    const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null); // To store interval ID for cleanup
    const [currentValue, setCurrentValue] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState<Plan>({} as Plan);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messagesErrorCreditCard, setMessagesErrorCreditCard] = useState<[] | null>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pixIntervalRef = useRef<NodeJS.Timeout | null>(null); // To store PIX interval ID for cleanup
    const [isGeneratingPix, setIsGeneratingPix] = useState(false); // Add state for manual pix generation
    const [selectedBillingDay, setSelectedBillingDay] = useState<number>(1); // New state for selected billing day

    if (user.id !== user?.entity?.config?.main_user_id && userIsBlock() && !checkRole('Lead')) {

        return (
            <section
                className="p-4"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#f0f4f8',
                    fontFamily: "'Nunito', sans-serif",
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.1)',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '800px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: "'Montserrat', 'Nunito', sans-serif",
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            color: '#18306b',
                            lineHeight: 1.4,
                            marginBottom: '1.2rem',
                        }}
                    >
                        O acesso ao sistema está temporariamente indisponível
                    </h1>
                    <p
                        style={{
                            fontSize: '1.125rem',
                            lineHeight: 1.6,
                            color: '#4b5563',
                            marginBottom: '1.5rem',
                        }}
                    >
                        A conta da empresa ainda não foi regularizada. Estamos trabalhando para resolver isso o mais rápido possível. Por favor, tente novamente mais tarde.
                    </p>
                    <p
                        style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                        }}
                    >
                        Se tiver dúvidas, entre em contato com o responsável pela empresa ou com o suporte.
                    </p>
                </div>
            </section>

        );
    }
    // Ref to store the Mercado Pago cardForm instance
    const cardFormRef = useRef<any>(null);

    const redirectToDetailsPayment = (order: any, type: string) => {
        if (!order || !order.id) return false;

        // If this order has already been acknowledged, do not redirect
        if (localStorage.getItem(`acknowledged_order_${type}_${order.id}`) === 'true') {
            return false;
        }

        const statusesWaiting = [
            'pending',
            'inprocess',
            'inmediation'
        ];
        return ((order.payment_form === 'credit_recurrence' && order.status === 'pending') ||
            (statusesWaiting.includes(order?.last_order_payment?.payment_status) && order?.last_order_payment?.payment_form !== 'pix') ||
            (order?.last_order_payment?.payment_status === 'approved' && order?.last_order_payment?.payment_form === 'pix')) &&
            order?.contract?.status !== 'cancelled' &&
            +order?.contract?.id !== +user?.entity?.current_contract?.id;
    }

    useEffect(() => {
        const type = periodicity === 'credits' ? 'credits' : 'plan';
        api.get(`/checkout/payment-details?type=${type}`).then(response => {
            if (redirectToDetailsPayment(response.data, type)) {
                api.get('/me').then(response => {
                    setUserLogged(response.data);
                    navigate(`/payment-status?type=${type}`);
                });
            }
        });
    }, [periodicity]);

    useEffect(() => {
        const type = periodicity === 'credits' ? 'credits' : 'plan';
        stopInterval();
        intervalRef.current = setInterval(() => {
            api.get(`/checkout/payment-details?type=${type}`).then(response => {
                if (redirectToDetailsPayment(response.data, type)) {
                    clearInterval(intervalRef.current!);
                    navigate(`/payment-status?type=${type}`);
                }
            });
        }, 5000);

        // Cleanup automático se o componente desmontar
        return () => {
            stopInterval()
        };
    }, [periodicity]);

    const stopInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (typeof MercadoPago === 'undefined' || paymentMethod !== 'card') {
            // Se não for método de cartão, ou MP não carregou, desmonte qualquer instância existente
            if (cardFormRef.current) {
                cardFormRef.current.unmount();
                cardFormRef.current = null;
                console.log("Mercado Pago cardForm unmounted.");
            }
            return;
        }
        if (cardFormRef.current) {
            cardFormRef.current.unmount(); // Desmonta a instância anterior para re-criar com novo `amount`
            console.log("Clearing existing Mercado Pago cardForm instance for re-initialization.");
            cardFormRef.current = null;
        }

        const isDarkMode = document.documentElement.getAttribute('data-theme-mode') === 'dark';
        const mp = new MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);

        cardFormRef.current = mp.cardForm({
            amount: currentValue.toFixed(2), // Pass current value with 2 decimal places
            iframe: true,
            form: {
                id: 'form-checkout',
                cardholderName: { id: 'form-checkout__cardholderName', placeholder: "Titular do cartão" },
                cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail' },
                cardNumber: {
                    id: 'form-checkout__cardNumber-container',
                    placeholder: 'Número do cartão',
                    style: {
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        placeholderColor: isDarkMode ? '#475569' : '#94a3b8',
                    }
                },
                securityCode: {
                    id: 'form-checkout__securityCode-container',
                    placeholder: 'Código de segurança',
                    style: {
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        placeholderColor: isDarkMode ? '#475569' : '#94a3b8',
                    }
                },
                installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
                expirationDate: {
                    id: 'form-checkout__expirationDate-container',
                    placeholder: 'Data de vencimento (MM/YYYY)',
                    style: {
                        color: isDarkMode ? '#f8fafc' : '#1e293b',
                        placeholderColor: isDarkMode ? '#475569' : '#94a3b8',
                    }
                },
                identificationType: { id: 'form-checkout__identificationType', placeholder: 'Tipo de documento' },
                identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'Número do documento' },
                issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' }
            },
            callbacks: {
                onValidityChange: (error: any, field: any) => {
                    addFieldErrorMessages(error);
                },
                onFormMounted: function (error: any) {
                    setInterval(customizeInstallments, 3000);
                    if (error) return console.log('Callback para tratar o erro: montando o cardForm ', error);
                    // Definir o email do usuário aqui, uma vez que o formulário está montado
                    if (user?.email && document.getElementById('form-checkout__cardholderEmail')) {
                        (document.getElementById('form-checkout__cardholderEmail') as HTMLInputElement).value = user.email;
                    }
                },
                onError: (error: any) => {
                    addFieldErrorMessages(error);
                    setIsSubmitting(false); // Libere o botão caso tenha sido travado
                },
                onSubmit: async (event: Event) => {
                    event.preventDefault();

                    setIsSubmitting(true); // <-- Ativa loading

                    const cardFormInstance = cardFormRef.current;
                    if (cardFormInstance) {
                        const {
                            paymentMethodId, issuerId, cardholderEmail: email, amount, // 'amount' pode ser removido, pois já usamos currentValue
                            token: tokenPayment, installments, identificationNumber, identificationType
                        } = cardFormInstance.getCardFormData();

                        const token = localStorage.getItem('token');
                        const plan_id = selectedPlanId;
                        let apiUrl = '/api/checkout/charge-credit-card';

                        // A URL de subscrição deve ser usada apenas se for mensal e de cartão
                        if (periodicity === 'monthly' && paymentMethod === 'card') {
                            apiUrl = '/api/checkout/subscription';
                        } else if (periodicity === 'credits') {
                            apiUrl = '/api/credit-packages-shop/charge-card';
                        }

                        try {
                            let requestBody: any = {
                                periodicity,
                                plan_version_id: selectedPlanId,
                                installments,
                                payment_method_id: paymentMethodId,
                                issuer_id: issuerId,
                                payer_identification_type: identificationType,
                                payer_identification_number: identificationNumber,
                                plan_id,
                                token: tokenPayment
                            };

                            if (periodicity === 'credits') {
                                requestBody = {
                                    credit_package_id: selectedPkg?.id,
                                    token: tokenPayment,
                                    installments: Number(installments),
                                    payment_method_id: paymentMethodId,
                                    issuer_id: issuerId,
                                    payer_identification_type: identificationType,
                                    payer_identification_number: identificationNumber,
                                };
                            } else if (periodicity === 'monthly' && paymentMethod === 'card') {
                                requestBody.billing_day = selectedBillingDay; // Add billing_day as integer
                            }

                            const response = await fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify(requestBody)
                            });

                            const responseData = await response.json();

                            if (!response.ok) {
                                console.error('Payment error:', responseData);
                                alert('Erro ao realizar pagamento, verifique os dados e tente novamente.');
                                if (responseData?.errors && responseData.errors.length > 0) {
                                    setMessagesErrorCreditCard(responseData.errors);
                                }
                            } else {
                                stopInterval();
                                navigate('/payment-status?type=' + (periodicity === 'credits' ? 'credits' : 'plan')); // ✅ Redirecionamento unificado para a tela premium
                            }
                        } catch (err) {
                            console.error('Error during payment fetch:', err);
                            alert('Ocorreu um erro inesperado ao processar o pagamento.');
                        } finally {
                            setIsSubmitting(false); // <-- Libera botão
                        }

                    }
                },
                onFetching: function (resource: string) {
                    const progressBar = document.querySelector('.progress-bar') as HTMLProgressElement;
                    if (progressBar) { progressBar.removeAttribute('value'); }
                    return () => {
                        if (progressBar) { progressBar.setAttribute('value', '0'); }
                    };
                }
            }
        });

        // Cleanup function for useEffect to unmount cardForm when component unmounts or dependencies change significantly
        return () => {
            if (cardFormRef.current) {
                cardFormRef.current.unmount();
                cardFormRef.current = null;
                console.log("Mercado Pago cardForm unmounted on cleanup.");
            }
        };

    }, [paymentMethod, currentValue, selectedPlanId, periodicity]);

    // O restante do seu código permanece igual...

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/home.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link); // Clean up on unmount
        };
    }, []);

    // Effect for fetching plans on component mount
    useEffect(() => {
        api.get('/plans?all=1')
            .then(response => {
                const sorted = [...response.data].sort((a, b) => (a.latest_version?.monthly_value ?? 0) - (b.latest_version?.monthly_value ?? 0));
                setPlans(sorted);
                if (response.data.length) {
                    const userPlanVersionId = user?.current_order?.plan_version_id;
                    const userPeriodicity = user?.current_order?.periodicity;

                    let initialSelectedPlanId = userPlanVersionId;
                    let initialPeriodicity: any = new URLSearchParams(window.location.search).get('mode') === 'credits'
                        ? 'credits'
                        : (userPeriodicity || 'monthly'); // Default to monthly if not set

                    // If user has no current order or the plan doesn't exist, select the first available PAID plan
                    const firstPaidPlan = sorted.find(plan => !isFreePlan(plan));
                    if (initialPeriodicity !== 'credits' && (!initialSelectedPlanId || !response.data.some(plan => plan.latest_version.id === initialSelectedPlanId))) {
                        initialSelectedPlanId = firstPaidPlan?.latest_version?.id || null;
                        initialPeriodicity = 'monthly'; // Reset periodicity for default plan
                    }

                    setSelectedPlanId(initialSelectedPlanId);
                    setPeriodicity(initialPeriodicity);

                    const selectedPlanProcessed = response.data.find(plan => plan?.latest_version?.id === initialSelectedPlanId);
                    setSelectedPlan(selectedPlanProcessed || {} as Plan); // Handle case where no plan is found

                    setCurrentValue(selectedPlanProcessed
                        ? (initialPeriodicity === 'monthly' ? selectedPlanProcessed?.latest_version?.monthly_value : selectedPlanProcessed?.latest_version?.annual_value) / 100
                        : 0);

                    // Set initial payment method to 'card' if not free plan, otherwise null
                    if (selectedPlanProcessed && !isFreePlan(selectedPlanProcessed)) {
                        setPaymentMethod('card');
                    } else {
                        setPaymentMethod(null);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching plans:", error);
                // Handle error (e.g., show a message to the user)
            });

        // Fetch credit packages
        api.get('/credit-packages-shop')
            .then(res => {
                setPackages(res.data);
                if (res.data.length) {
                    const searchParams = new URLSearchParams(window.location.search);
                    const isAvulso = searchParams.get('package') === 'avulso';
                    if (isAvulso) {
                        const avulsoPkg = res.data.find((pkg: CreditPackage) => pkg.credits === 1 || pkg.name.toLowerCase().includes('avulso'));
                        if (avulsoPkg) {
                            setSelectedPkg(avulsoPkg);
                            return;
                        }
                    }
                    setSelectedPkg(res.data[0]);
                }
            })
            .catch(() => toast.error('Erro ao carregar pacotes de créditos.'));
    }, [user?.current_order]); // Depende do user.current_order para carregar planos com base no usuário

    useEffect(() => {
        if (periodicity === 'credits') {
            setCurrentValue(selectedPkg ? selectedPkg.price : 0);
            if (selectedPkg?.credits === 1) {
                setPaymentMethod('pix');
            } else if (!paymentMethod) {
                setPaymentMethod('card');
            }
            return;
        }

        const selectedPlanProcessed = plans.find(plan => plan?.latest_version?.id === +selectedPlanId!);
        setSelectedPlan(selectedPlanProcessed as Plan);
        // Atualize o paymentMethod aqui também se o plano selecionado mudar para um plano gratuito.
        if (selectedPlanProcessed && isFreePlan(selectedPlanProcessed)) {
            setPaymentMethod(null);
        } else if (selectedPlanProcessed && !paymentMethod) {
            // Se o plano não for gratuito e nenhum método de pagamento estiver selecionado, defina para cartão
            setPaymentMethod('card');
        }

        setCurrentValue(selectedPlanProcessed
            ? (periodicity === 'monthly' ? selectedPlanProcessed?.latest_version?.monthly_value : selectedPlanProcessed?.latest_version?.annual_value) / 100
            : 0);

    }, [selectedPlanId, periodicity, plans, selectedPkg]); // Adicione 'plans' como dependência para que reaja a `setPlans`


    useEffect(() => {
        // Clear any existing PIX related states if method changes or plan changes
        setQrCode(null);
        setPixCopyPasteCode(null);

        // Stop any ongoing polling if payment method or plan changes
        if (pixIntervalRef.current) {
            clearInterval(pixIntervalRef.current);
            pixIntervalRef.current = null;
        }
    }, [paymentMethod, selectedPlanId, periodicity, selectedPkg]);

    const generatePix = () => {
        setIsGeneratingPix(true);
        if (paymentMethod === 'pix') {
            if (periodicity === 'credits' && selectedPkg) {
                api.post('/credit-packages-shop/pix', { credit_package_id: selectedPkg.id })
                    .then(response => {
                        setQrCode(response.data.mercadopago_pix_qrcode);
                        setPixCopyPasteCode(response.data.mercadopago_copy_and_past);
                        setIsGeneratingPix(false);

                        if (response.data.credits_granted) {
                            setPixSuccess(true);
                        } else {
                            const interval = setInterval(async () => {
                                try {
                                    const poll = await api.get(`/credit-packages-shop/orders/${response.data.order_id}/status`);
                                    if (poll.data.credits_granted) {
                                        if (pixIntervalRef.current) clearInterval(pixIntervalRef.current);
                                        setPixSuccess(true);
                                        navigate('/payment-status?type=credits');
                                    }
                                } catch { /* ignore polling errors */ }
                            }, 5000);
                            pixIntervalRef.current = interval;
                        }
                    })
                    .catch(error => {
                        console.error("Error generating PIX QR code:", error);
                        toast.error('Erro ao gerar o QR Code PIX.');
                        setIsGeneratingPix(false);
                    });
            } else if (selectedPlanId && plans.length > 0) {
                const planToPay = plans.find(plan => plan.latest_version.id === +selectedPlanId);
                if (planToPay && !isFreePlan(planToPay)) {
                    const data = {
                        periodicity,
                        plan_version_id: selectedPlanId,
                    };
                    api.post('/checkout/generate-qrcode', data)
                        .then(response => {
                            setQrCode(response.data.mercadopago_pix_qrcode);
                            setPixCopyPasteCode(response.data.mercadopago_copy_and_past); // Assuming backend returns pix_code
                            setIsGeneratingPix(false);
                        })
                        .catch(error => {
                            console.error("Error generating PIX QR code:", error);
                            alert('Erro ao gerar o QR Code PIX. Por favor, tente novamente.');
                            setIsGeneratingPix(false);
                        });
                }
            }
        }
    };

    const copyPixCodeToClipboard = () => {
        if (pixCopyPasteCode) {
            navigator.clipboard.writeText(pixCopyPasteCode)
                .then(() => {
                    alert('Código PIX copiado para a área de transferência!');
                })
                .catch(err => {
                    console.error('Erro ao copiar código PIX:', err);
                    alert('Não foi possível copiar o código PIX.');
                });
        }
    };

    const isFreePlan = (plan: Plan) => {
        // Verifica se plan e suas propriedades existem antes de acessar
        return !(plan?.monthly_value || plan?.annual_value);
    }

    const registerFreePlan = async () => {
        setIsSubmitting(true);
        try {
            const data = {
                plan_id: selectedPlanId
            }
            const response = await api.post('/checkout/free-plan', data);

            if (!response?.data) {
                toast.error("Ocorreu um erro ao criar o contrato gratuito.");
                return;
            }

            const { data: user } = await api.get('/me');
            setUserLogged(user);

            Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Solicitação realizada com sucesso",
                showCancelButton: false,
                showDenyButton: false,
                confirmButtonText: "Testar gratuitamente",
                allowOutsideClick: true,
                allowEscapeKey: true,
            }).then((result) => {
                if (result.isConfirmed || result.dismiss === Swal.DismissReason.backdrop || result.dismiss === Swal.DismissReason.esc) {
                    navigate('/profile', { reload: true }); // Pode ser interessante recarregar o perfil aqui
                }
            });
        } catch (error) {
            console.error("Error registering free plan:", error);
            toast.error("Ocorreu um erro ao registrar o plano gratuito.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function customizeInstallments() {
        const installmentsSelect = document.getElementById("form-checkout__installments");
        if (installmentsSelect) {
            Array.from(installmentsSelect.options).forEach(option => {
                // Exemplo: Oculta o valor total na opção de parcelas
                let parts = option.text.split(' (');
                if (parts.length > 1) {
                    option.text = parts[0]; // Mantém apenas a quantidade de parcelas
                }
            });
        }
    }

    function addFieldErrorMessages(error: [] | null) {
        if (error) {
            setMessagesErrorCreditCard(error);
        } else {
            setMessagesErrorCreditCard([]);
        }
    }

    const CheckIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );

    const savingsPercent = (() => {
        const mv = selectedPlan?.latest_version?.monthly_value || 0;
        const av = selectedPlan?.latest_version?.annual_value || 0;
        return mv > 0 ? Math.round((mv - av / 12) / mv * 100) : 0;
    })();

    return (
        <Fragment>
            <section className="checkout-scope checkout-page">
                <div className="checkout-container">

                    {/* ── FORM COLUMN ── */}
                    <div className="checkout-form-col">

                        {/* Header */}
                        <div className="ck-header">
                            <span className="ck-secure-tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                AMBIENTE 100% SEGURO
                            </span>
                            <h1 className="ck-title">Finalize sua assinatura</h1>
                            <p className="ck-subtitle">Escolha o plano ideal e comece agora mesmo</p>
                        </div>

                        {/* BLOCO 1: Periodicidade e Modalidade */}
                        <div className="ck-block">
                            <h3 className="ck-block-title">
                                <span className="step-num">1</span>
                                Modalidade
                            </h3>
                            <div className="plan-grid">
                                {/* Mensal */}
                                <div
                                    className={`plan-card${periodicity === 'monthly' ? ' plan-card--selected' : ''}`}
                                    onClick={() => {
                                        setPaymentMethod('card');
                                        setPeriodicity('monthly');
                                        const firstPaid = plans.find(p => !isFreePlan(p));
                                        if (firstPaid) setSelectedPlanId(String(firstPaid.latest_version.id));
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px', padding: '1rem' }}
                                >
                                    {periodicity === 'monthly' && (
                                        <span className="plan-card__check">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                    <div className="plan-card__name" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Mensal</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>
                                        Recorrente
                                    </div>
                                </div>

                                {/* Anual */}
                                <div
                                    className={`plan-card${periodicity === 'annual' ? ' plan-card--selected' : ''}`}
                                    onClick={() => {
                                        setPeriodicity('annual');
                                        const firstPaid = plans.find(p => !isFreePlan(p));
                                        if (firstPaid) setSelectedPlanId(String(firstPaid.latest_version.id));
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px', padding: '1rem' }}
                                >
                                    {periodicity === 'annual' && (
                                        <span className="plan-card__check">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                    <div className="plan-card__name" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Anual</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', marginBottom: savingsPercent > 0 ? '6px' : '0' }}>
                                        Pagamento anual
                                    </div>
                                    {savingsPercent > 0 && (
                                        <span className="period-savings-badge" style={{ position: 'static', transform: 'none', display: 'inline-block' }}>
                                            Economize {savingsPercent}%
                                        </span>
                                    )}
                                </div>

                                {/* Créditos Avulsos */}
                                <div
                                    className={`plan-card${periodicity === 'credits' ? ' plan-card--selected' : ''}`}
                                    onClick={() => setPeriodicity('credits')}
                                    role="button"
                                    tabIndex={0}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px', padding: '1rem' }}
                                >
                                    {periodicity === 'credits' && (
                                        <span className="plan-card__check">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                    <div className="plan-card__name" style={{ fontSize: '1.25rem', marginBottom: '8px', color: periodicity === 'credits' ? '#2563eb' : '' }}>
                                        <i className="las la-coins" style={{ marginRight: '6px' }}></i>
                                        Créditos
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>
                                        Compra avulsa
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BLOCO 2: Seleção de Plano ou Pacote */}
                        <div className="ck-block">
                            <h3 className="ck-block-title">
                                <span className="step-num">2</span>
                                {periodicity === 'credits' ? 'Escolha o pacote de créditos' : 'Escolha seu plano'}
                            </h3>
                            {periodicity === 'credits' ? (
                                <div className="plan-grid">
                                    {packages?.map(pkg => {
                                        const isSelected = selectedPkg?.id === pkg.id;
                                        return (
                                            <div
                                                key={pkg.id}
                                                className={`plan-card${isSelected ? ' plan-card--selected' : ''}`}
                                                onClick={() => setSelectedPkg(pkg)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={e => e.key === 'Enter' && setSelectedPkg(pkg)}
                                            >
                                                {isSelected && (
                                                    <span className="plan-card__check">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <div className="plan-card__name" style={{ whiteSpace: 'nowrap' }}>{pkg.name}</div>
                                                <div className="plan-card__price">
                                                    <span className="price--currency">R$</span>
                                                    <span className="price--value">{changePointToComma(Number(pkg.price).toFixed(2))}</span>
                                                </div>
                                                <div className="plan-card__certs">
                                                    {pkg.credits} créditos
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                                    Validade: {pkg.validity_days} dias
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    <div className="plan-grid">
                                        {plans?.filter(plan => !isFreePlan(plan)).map(plan => {
                                            const isSelected = String(plan.latest_version.id) == String(selectedPlanId);
                                            const displayPrice = periodicity === 'annual'
                                                ? (paymentMethod === 'pix' ? plan.latest_version.annual_value / 100 : (plan.latest_version.annual_value / 12) / 100)
                                                : plan.latest_version.monthly_value / 100;
                                            return (
                                                <div
                                                    key={plan.latest_version.id}
                                                    className={`plan-card${isSelected ? ' plan-card--selected' : ''}`}
                                                    onClick={() => setSelectedPlanId(String(plan.latest_version.id))}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={e => e.key === 'Enter' && setSelectedPlanId(String(plan.latest_version.id))}
                                                >
                                                    {isSelected && (
                                                        <span className="plan-card__check">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                    <div className="plan-card__name">{firstLetterUppercase(plan.name)}</div>

                                                    <div className="plan-card__price-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        {periodicity === 'annual' && paymentMethod !== 'pix' && (
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                                                                até 12x de
                                                            </div>
                                                        )}
                                                        <div className="plan-card__price">
                                                            <span className="price--currency">R$</span>
                                                            <span className="price--value">{changePointToComma(displayPrice.toFixed(2))}</span>
                                                            <span className="price--period">
                                                                {periodicity === 'annual' && paymentMethod === 'pix' ? '/ano' : '/mês'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {(plan.latest_version.quantity_certificates > 0) && (
                                                        <div className="plan-card__certs">
                                                            {plan.latest_version.quantity_certificates} cert/mês
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <ul className="d-md-none plan-benefits-sm">
                                        {selectedPlan?.latest_version?.benefits?.map((item, index) => (
                                            <li key={index} className="plan-benefit-sm-item">
                                                <CheckIcon />
                                                <span>{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* BLOCO 3: Forma de Pagamento */}
                        {((periodicity !== 'credits' && !isFreePlan(selectedPlan)) || periodicity === 'credits') && (
                            <div className="ck-block">
                                <h3 className="ck-block-title">
                                    <span className="step-num">3</span>
                                    Forma de Pagamento
                                </h3>
                                <div className="payment-method-tabs">
                                    {!(periodicity === 'credits' && selectedPkg?.credits === 1) && (
                                        <button
                                            type="button"
                                            className={`pm-tab${paymentMethod === 'card' ? ' pm-tab--active' : ''}`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                                            </svg>
                                            Cartão de Crédito
                                        </button>
                                    )}
                                    {((periodicity === 'annual' && !isFreePlan(selectedPlan)) || periodicity === 'credits') && (
                                        <button
                                            type="button"
                                            className={`pm-tab${paymentMethod === 'pix' ? ' pm-tab--active' : ''}`}
                                            onClick={() => setPaymentMethod('pix')}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                            </svg>
                                            PIX (À vista)
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* BLOCO 4: Formulário Cartão */}
                        <div className="ck-block" style={{ display: paymentMethod === 'card' && (periodicity === 'credits' || !isFreePlan(selectedPlan)) ? 'block' : 'none' }}>
                            <h3 className="ck-block-title">
                                <span className="step-num">4</span>
                                Dados do Cartão
                            </h3>
                            {periodicity === 'monthly' && (
                                <p className="recurrence-info">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    Cobrança recorrente mensal via cartão de crédito
                                </p>
                            )}

                            {periodicity === 'annual' && (
                                <div className="annual-installment-box">
                                    <div className="annual-installment-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                    </div>
                                    <div className="annual-installment-text">
                                        <strong>Pagamento Facilitado</strong>
                                        <span>Sua assinatura anual pode ser dividida em <strong>12 parcelas de R$ {changePointToComma(((selectedPlan?.latest_version?.annual_value || 0) / 1200).toFixed(2))}</strong> no seu cartão de crédito.</span>
                                    </div>
                                </div>
                            )}

                            <form id="form-checkout" className="form">
                                <div className="field-wrap">
                                    <label className="field-label">Número do Cartão</label>
                                    <div id="form-checkout__cardNumber-container" className="container input-form"></div>
                                </div>

                                <div className="field-wrap">
                                    <label className="field-label">Titular do Cartão</label>
                                    <input
                                        type="text"
                                        className="input-form"
                                        required
                                        name="cardholderName"
                                        id="form-checkout__cardholderName"
                                        placeholder="Nome como aparece no cartão"
                                    />
                                </div>

                                <div className="form-row-2">
                                    <div className="field-wrap">
                                        <label className="field-label">Validade</label>
                                        <div id="form-checkout__expirationDate-container" className="container input-form"></div>
                                    </div>
                                    <div className="field-wrap">
                                        <label className="field-label">CVV</label>
                                        <div id="form-checkout__securityCode-container" className="container input-form"></div>
                                    </div>
                                </div>

                                <input type="email" name="cardholderEmail" className="d-none" id="form-checkout__cardholderEmail" />
                                <select className="d-none" name="issuer" id="form-checkout__issuer"></select>

                                <div className="form-row-2">
                                    <div className="field-wrap">
                                        <label className="field-label">Tipo de Documento</label>
                                        <select name="identificationType" className="input-form" id="form-checkout__identificationType"></select>
                                    </div>
                                    <div className="field-wrap">
                                        <label className="field-label">Número do Documento</label>
                                        <input
                                            type="text"
                                            className="input-form"
                                            required
                                            name="identificationNumber"
                                            id="form-checkout__identificationNumber"
                                            placeholder="CPF / CNPJ"
                                        />
                                    </div>
                                </div>

                                {periodicity === 'annual' && (
                                    <div className="field-wrap">
                                        <label className="field-label">Parcelas</label>
                                    </div>
                                )}
                                <select
                                    name="installments"
                                    id="form-checkout__installments"
                                    className="input-form"
                                    style={{ display: periodicity === 'annual' ? '' : 'none' }}
                                ></select>

                                {messagesErrorCreditCard && messagesErrorCreditCard.length > 0 && (
                                    <div className="error-wrap">
                                        {messagesErrorCreditCard.map((item: any, index: number) => (
                                            <Badge bg="danger" key={index} className="mb-1">
                                                {translateMessageError(item?.message) ?? item?.message}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {periodicity === 'monthly' && (
                                    <div className="billing-day-wrap">
                                        <label className="field-label">Melhor dia para cobrança</label>
                                        <div className="billing-days">
                                            {[1, 3, 7, 10, 15].map(day => (
                                                <button
                                                    type="button"
                                                    key={day}
                                                    className={`billing-day-btn${selectedBillingDay === day ? ' billing-day-btn--active' : ''}`}
                                                    onClick={() => setSelectedBillingDay(day)}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="button-payment"
                                    type="submit"
                                    id="form-checkout__submit"
                                    disabled={isSubmitting}
                                    onClick={() => { setTimeout(() => { setIsSubmitting(true); }, 0); }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Processando pagamento...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            Finalizar Pagamento

                                        </>
                                    )}
                                </button>
                                <progress value="0" className="progress-bar d-none">Carregando...</progress>
                            </form>
                        </div>

                        {/* BLOCO PIX */}
                        {paymentMethod === 'pix' && (periodicity === 'credits' || !isFreePlan(selectedPlan)) && (
                            <div className="ck-block pix-block">
                                <h3 className="ck-block-title">
                                    <span className="step-num">4</span>
                                    Pagamento via PIX
                                </h3>
                                <p className="pix-instructions">
                                    Escaneie o QR Code ou copie o código no seu aplicativo de banco.
                                </p>
                                <div className="pix-price-badge">
                                    R$ {changePointToComma(currentValue.toFixed(2))}
                                    <span> à vista</span>
                                </div>
                                {qrCode ? (
                                    <div className="pix-qr-area">
                                        <img
                                            src={`data:image/png;base64,${qrCode}`}
                                            alt="QR Code PIX"
                                            className="pix-qr-img"
                                        />
                                        {pixCopyPasteCode && (
                                            <div className="pix-copy-area">
                                                <p className="pix-copy-label">Ou copie o código PIX:</p>
                                                <div className="pix-copy-box">
                                                    <input
                                                        type="text"
                                                        value={pixCopyPasteCode}
                                                        readOnly
                                                        className="pix-code-input"
                                                    />
                                                    <button type="button" onClick={copyPixCodeToClipboard} className="pix-copy-btn">
                                                        Copiar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <p className="pix-waiting">
                                            <span className="pix-pulse"></span>
                                            Aguardando confirmação do pagamento...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pix-loading text-center" style={{ padding: '2rem 0' }}>
                                        <button
                                            className="button-payment"
                                            onClick={generatePix}
                                            disabled={isGeneratingPix}
                                            style={{ margin: '0 auto', maxWidth: '250px' }}
                                        >
                                            {isGeneratingPix ? (
                                                <><span className="btn-spinner"></span> Gerando PIX...</>
                                            ) : (
                                                'Gerar QRCode PIX'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Plano Gratuito */}
                        <If condition={periodicity !== 'credits' && isFreePlan(selectedPlan)}>
                            <div className="ck-block">
                                <button
                                    className="button-payment"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={registerFreePlan}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        'Começar gratuitamente →'
                                    )}
                                </button>
                            </div>
                        </If>

                        {/* Barra de Confiança */}
                        <div className="ck-trust-bar">
                            <div className="trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Pagamento Seguro
                            </div>
                            <div className="trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Cancele quando quiser
                            </div>
                            <div className="trust-item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Suporte Dedicado
                            </div>
                        </div>
                    </div>

                    {/* ── COLUNA DE RESUMO ── */}
                    <div className="checkout-summary-col d-none d-md-flex">
                        <div className="order-card">
                            <div className="order-card__header">
                                <div className="order-card__plan-icon">
                                    {periodicity === 'credits' ? (
                                        <i className="las la-coins" style={{ fontSize: '1.5rem' }}></i>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="order-card__plan-name">
                                        {periodicity === 'credits' ? selectedPkg?.name : firstLetterUppercase(selectedPlan?.name || '')}
                                    </div>
                                    <div className="order-card__plan-type">
                                        {periodicity === 'credits' ? 'Pacote de Créditos' : (periodicity === 'monthly' ? 'Assinatura Mensal' : 'Assinatura Anual')}
                                    </div>
                                </div>
                            </div>

                            <div className="order-card__price-area">
                                {periodicity === 'credits' ? (
                                    <div className="order-price">
                                        <span className="order-price__prefix">R$</span>
                                        <span className="order-price__amount">
                                            {changePointToComma(Number(selectedPkg?.price || 0).toFixed(2))}
                                        </span>
                                    </div>
                                ) : !isFreePlan(selectedPlan) ? (
                                    <>
                                        <div className="order-price">
                                            {periodicity === 'annual' && paymentMethod === 'card' && (
                                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginRight: '4px', alignSelf: 'center' }}>
                                                    até 12x de
                                                </span>
                                            )}
                                            <span className="order-price__prefix">R$</span>
                                            <span className="order-price__amount">
                                                {periodicity === 'annual' && paymentMethod === 'card'
                                                    ? changePointToComma((currentValue / 12).toFixed(2))
                                                    : changePointToComma(currentValue.toFixed(2))}
                                            </span>
                                            <span className="order-price__period">
                                                {periodicity === 'annual' && paymentMethod === 'card' ? '/mês' : (periodicity === 'monthly' ? '/mês' : (periodicity === 'annual' && paymentMethod === 'pix' ? '/ano' : ''))}
                                            </span>
                                        </div>
                                        {periodicity === 'annual' && (
                                            <div className="order-card__annual-note">
                                                {paymentMethod === 'card'
                                                    ? `Cobrado anualmente: R$ ${changePointToComma(currentValue.toFixed(2))}`
                                                    : `Pagamento à vista: R$ ${changePointToComma(currentValue.toFixed(2))}`}
                                            </div>
                                        )}
                                        {savingsPercent > 0 && periodicity === 'annual' && (
                                            <div className="order-card__savings-tag">
                                                Você economiza {savingsPercent}% no plano anual
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="order-price">
                                        <span className="order-price__free">Grátis</span>
                                    </div>
                                )}
                            </div>

                            <hr className="order-card__divider" />

                            <ul className="order-card__benefits">
                                {periodicity === 'credits' ? (
                                    <>
                                        <li className="order-benefit">
                                            <CheckIcon />
                                            {selectedPkg?.credits} créditos para certificados
                                        </li>
                                        <li className="order-benefit">
                                            <CheckIcon />
                                            Validade de {selectedPkg?.validity_days} dias
                                        </li>
                                        <li className="order-benefit">
                                            <CheckIcon />
                                            Adição imediata
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        {(selectedPlan?.latest_version?.quantity_certificates > 0) && (
                                            <li className="order-benefit">
                                                <CheckIcon />
                                                {selectedPlan.latest_version.quantity_certificates} certificados por mês
                                            </li>
                                        )}
                                        {selectedPlan?.latest_version?.benefits?.map((benefit: any) => (
                                            <li key={benefit.id} className="order-benefit">
                                                <CheckIcon />
                                                {benefit.name}
                                            </li>
                                        ))}
                                    </>
                                )}
                            </ul>

                            <div className="order-card__guarantee">
                                <div className="guarantee-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div className="guarantee-text">
                                    <strong>{periodicity === 'credits' ? 'Compra Segura' : 'Satisfação Garantida'}</strong>
                                    <span>{periodicity === 'credits' ? 'Pagamento processado com segurança.' : 'Cancele a qualquer momento sem burocracia'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bloco de Segurança Extra no Desktop */}
                        <div className="security-card">
                            <div className="security-card__title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Checkout Seguro
                            </div>
                            <p className="security-card__text">
                                Seus dados estão protegidos por criptografia de ponta a ponta e processados com segurança.
                            </p>

                        </div>
                    </div>

                </div>
            </section>
            <ToastContainer />
        </Fragment>
    );
};

export default CheckoutScreen;

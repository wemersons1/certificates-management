import { FC, useContext, useEffect, useState } from 'react';
import AppContext from '../../AppContext/Context';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '@/src/assets/lotties/success.json';

interface User {
  email: string;
  current_order?: {
    status: string;
  };
  entity?: any;
  email_verified_at?: string;
}

const PaymentProcessedScreen: FC = () => {
  const { setUserLogged, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string>('/');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [purchasedCredits, setPurchasedCredits] = useState<number | null>(null);
  const [currentTotalCredits, setCurrentTotalCredits] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get('type') || 'plan';

  const redirectToProfile = () => {
    return user?.current_order?.status === 'completed' && !user?.entity && user?.email_verified_at;
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const fetchPaymentDetails = async () => {
      try {
        const response = await api.get(`/checkout/payment-details?type=${type}`);
        const order = response.data;
        const status = order?.last_order_payment?.payment_status || 'pending';
        setPaymentStatus(status);

        if (order) {
          if (order.id) {
            setOrderId(order.id);
          }
          if (type === 'credits' && order.credit_package?.credits) {
            setPurchasedCredits(order.credit_package.credits);
          } else if (type === 'plan' && order.plan_version?.quantity_certificates) {
            setPurchasedCredits(order.plan_version.quantity_certificates);
          }
        }

        if (status === 'approved') {
          if (intervalId) clearInterval(intervalId);
          window.dispatchEvent(new Event('credits-updated'));

          if (order && order.id) {
            localStorage.setItem(`acknowledged_order_${type}_${order.id}`, 'true');
          }

          try {
            const balanceRes = await api.get('/credits/balance');
            setCurrentTotalCredits(balanceRes.data.total);
          } catch (e) {
            console.error("Error fetching balance:", e);
          }

          setMessage('Seu pagamento foi aprovado com sucesso! 🎉');
          setButtonText('Usar o Aplicativo');
          setRedirectPath('/documents/create');
          setIsLoading(false);
          return;
        }

        if (order?.status === 'pending' && order?.payment_form == 'credit_recurrence') {
          setMessage('Seu pagamento está aguardando confirmação. Por favor, aguarde. A confirmação pode levar até 2 horas para ser processada.');
          setButtonText('');
          return;
        }

        switch (status) {
          case 'pending':
          case 'inprocess':
          case 'inmediation':
            setMessage('Seu pagamento está aguardando confirmação. Por favor, aguarde. ⏳');
            setButtonText('');
            break;
          case 'rejected':
            setMessage('Seu pagamento foi rejeitado. Por favor, tente novamente. ❌');
            setButtonText('Tentar Novamente');
            setRedirectPath('/checkout');
            if (intervalId) clearInterval(intervalId);
            break;
          case 'cancelled':
            setMessage('Seu pagamento foi cancelado. 😔');
            setButtonText('Voltar para o Pagamento');
            setRedirectPath('/checkout');
            if (intervalId) clearInterval(intervalId);
            break;
          case 'refunded':
            setMessage('Seu pagamento foi reembolsado. ✅');
            setButtonText('Voltar para o Pagamento');
            setRedirectPath('/checkout');
            if (intervalId) clearInterval(intervalId);
            break;
          case 'chargedback':
            setMessage('Houve um estorno em seu pagamento. 💳');
            setButtonText('Voltar para o Pagamento');
            setRedirectPath('/checkout');
            if (intervalId) clearInterval(intervalId);
            break;
          default:
            setMessage('Status de pagamento desconhecido. 🤷‍♀️');
            setButtonText('Voltar para o Pagamento');
            setRedirectPath('/checkout');
            break;
        }
      } catch (error) {
        setMessage('Erro ao verificar o status do pagamento. 😕');
        setButtonText('Voltar');
        setRedirectPath('/');
        if (intervalId) clearInterval(intervalId);
      } finally {
        setIsLoading(false);
      }
    };

    intervalId = setInterval(fetchPaymentDetails, 5000);
    fetchPaymentDetails();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, setUserLogged, navigate, type]);

  const renderStatusIcon = () => {
    if (isLoading) {
      return <div className="loader-spinner" />;
    }

    if (paymentStatus === 'approved') {
      return (
        <div className="lottie-container">
          <Lottie
            animationData={successAnimation}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    }

    if (paymentStatus === 'rejected') {
      return (
        <div className="status-icon-wrapper rejected">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      );
    }

    if (['pending', 'inprocess', 'inmediation'].includes(paymentStatus)) {
      return (
        <div className="status-icon-wrapper pending">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      );
    }

    return (
      <div className="status-icon-wrapper neutral">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
    );
  };

  return (
    <section className="payment-processed-container">
      <style>{`
        .payment-processed-container {
          /* LIGHT MODE VARIABLES */
          --bg-color: #f8fafc;
          --bg-gradient: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08), transparent 50%),
                         radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05), transparent 50%);
          --card-bg: rgba(255, 255, 255, 0.95);
          --card-border: rgba(0, 0, 0, 0.05);
          --card-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --glow-top: rgba(59, 130, 246, 0.2);
          --lottie-glow: rgba(34, 197, 94, 0.15);
          --btn-bg: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          --btn-hover: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          --btn-shadow: rgba(37, 99, 235, 0.25);
          --status-pending-bg: rgba(245, 158, 11, 0.1);
          --status-pending-border: rgba(245, 158, 11, 0.3);
          --status-rejected-bg: rgba(239, 68, 68, 0.1);
          --status-rejected-border: rgba(239, 68, 68, 0.3);
          --status-neutral-bg: rgba(100, 116, 139, 0.1);
          --status-neutral-border: rgba(100, 116, 139, 0.3);
          
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--bg-color);
          background-image: var(--bg-gradient);
          padding: 1.5rem;
          font-family: 'Nunito', sans-serif;
          box-sizing: border-box;
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* DARK MODE VARIABLES */
        [data-theme-mode="dark"] .payment-processed-container,
        [data-theme="dark"] .payment-processed-container,
        .dark .payment-processed-container {
          --bg-color: #0b0e14;
          --bg-gradient: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 50%),
                         radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1), transparent 50%);
          --card-bg: #151821;
          --card-border: rgba(255, 255, 255, 0.05);
          --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --glow-top: rgba(59, 130, 246, 0.5);
          --lottie-glow: rgba(34, 197, 94, 0.3);
          --btn-bg: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          --btn-hover: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          --btn-shadow: rgba(37, 99, 235, 0.4);
        }

        .payment-card {
          background: var(--card-bg);
          border-radius: 24px;
          box-shadow: var(--card-shadow);
          padding: 3.5rem 2rem;
          max-width: 550px;
          width: 100%;
          text-align: center;
          border: 1px solid var(--card-border);
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .payment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--glow-top), transparent);
          transition: background 0.3s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .payment-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
        }
        
        .payment-title.approved {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .payment-message {
          font-size: 1.15rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          transition: color 0.3s ease;
        }
        
        .payment-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: var(--btn-bg);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 1.25rem 3.5rem;
          font-size: 1.05rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          box-shadow: 0 8px 25px var(--btn-shadow), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        
        .payment-btn::before {
          content: '';
          position: absolute;
          top: 0; 
          left: -100%; 
          width: 50%; 
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.25), transparent);
          transform: skewX(-20deg);
          animation: shine 4s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        
        .payment-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px var(--btn-shadow), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.25);
          background: var(--btn-hover);
        }
        
        .payment-btn:active {
          transform: translateY(0);
          box-shadow: 0 5px 15px var(--btn-shadow);
        }

        .payment-btn svg {
          width: 22px;
          height: 22px;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .payment-btn:hover svg.icon-rocket {
          transform: translate(4px, -4px) rotate(5deg) scale(1.1);
        }

        .payment-btn:hover svg.icon-arrow {
          transform: translateX(-4px);
        }
        
        /* Icon styles */
        .lottie-container {
          width: 140px;
          height: 140px;
          margin: 0 auto 1.5rem auto;
          pointer-events: none;
          position: relative;
        }
        
        .lottie-container::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background: var(--lottie-glow);
            filter: blur(40px);
            transform: translate(-50%, -50%);
            z-index: -1;
            transition: background 0.3s ease;
        }

        .status-icon-wrapper {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 1.5rem auto;
          position: relative;
        }
        
        .status-icon-wrapper.pending {
          background-color: var(--status-pending-bg);
          border: 1px solid var(--status-pending-border);
          box-shadow: 0 0 30px var(--status-pending-bg);
          animation: pulse-pending 2s infinite;
        }
        
        .status-icon-wrapper.rejected {
          background-color: var(--status-rejected-bg);
          border: 1px solid var(--status-rejected-border);
          box-shadow: 0 0 30px var(--status-rejected-bg);
        }
        
        .status-icon-wrapper.neutral {
          background-color: var(--status-neutral-bg);
          border: 1px solid var(--status-neutral-border);
        }
        
        @keyframes pulse-pending {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        /* Loading styles */
        .loader-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(128, 128, 128, 0.2);
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          margin: 2rem auto;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="payment-card">
        {renderStatusIcon()}

        <h1 className={`payment-title ${paymentStatus === 'approved' ? 'approved' : ''}`}>
          {isLoading ? 'Aguarde' : (paymentStatus === 'approved' ? 'Parabéns!' : 'Detalhes da transação')}
        </h1>

        {!isLoading && (
          <>
            <p className="payment-message">{message}</p>

            {paymentStatus === 'approved' && (purchasedCredits !== null || currentTotalCredits !== null) && (
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  marginBottom: '2.5rem',
                  gap: '1.5rem',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {purchasedCredits !== null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Adquiridos
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                      +{purchasedCredits}
                    </div>
                  </div>
                )}
                {currentTotalCredits !== null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Saldo Atualizado
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                      {currentTotalCredits}
                    </div>
                  </div>
                )}
              </div>
            )}

            {buttonText && (
              <button
                className="payment-btn"
                onClick={async () => {
                  if (paymentStatus === 'approved') {
                    if (orderId) {
                      localStorage.setItem(`acknowledged_order_${type}_${orderId}`, 'true');
                    }
                    const userResponse = await api.get('/me');
                    setUserLogged(userResponse.data);
                    setTimeout(() => {
                      navigate(redirectPath);
                    }, 100);
                  } else {
                    navigate(redirectPath);
                  }
                }}
              >
                {paymentStatus === 'approved' ? (
                  <svg className="icon-rocket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                ) : (
                  <svg className="icon-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                )}
                <span>{buttonText}</span>
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PaymentProcessedScreen;
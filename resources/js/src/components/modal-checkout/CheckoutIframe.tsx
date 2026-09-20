
 
 interface CheckoutIframeProps {
  src: string;
  onClose: () => void;
}

const CheckoutIframe: React.FC<CheckoutIframeProps> = ({ src, onClose }) => {
  return (
      <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
          <div style={{ position: 'relative', width: '90%', height: '90%' }}>
              <iframe
                  src={src}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '10px' }}
              ></iframe>
              <button
                className='bg-primary'
                  onClick={onClose}
                  style={{
                      position: 'absolute', top: '20px', right: '30px',
                      border: 'none', borderRadius: '50%',
                      width: '40px', height: '40px', cursor: 'pointer', fontSize: '26px'
                  }}
              >
                <i className="las la-times text-light"></i>  
              </button>
          </div>
      </div>
  );
};

export default CheckoutIframe;
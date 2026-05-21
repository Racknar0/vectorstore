'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useCart from '@/store/useCart';
import { apiGet, apiPost, apiUpload, resolveImageUrl } from '@/helpers/api';
import './checkout.scss';

export default function CheckoutPage() {
  const { items: cartItems, clearCart } = useCart();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [activePaymentId, setActivePaymentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const fileInputRef = useRef(null);

  const subtotal = cartItems.reduce((sum, d) => sum + (d.isFree ? 0 : d.pricePEN), 0);

  // Cargar métodos de pago activos del backend
  useEffect(() => {
    async function loadPaymentMethods() {
      try {
        setLoadingMethods(true);
        const data = await apiGet('/payment-methods');
        setPaymentMethods(data);
        if (data.length > 0) {
          setActivePaymentId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los métodos de pago.');
      } finally {
        setLoadingMethods(false);
      }
    }
    loadPaymentMethods();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo supera el límite de 5MB.');
        return;
      }
      setVoucherFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida (PNG, JPG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo supera el límite de 5MB.');
        return;
      }
      setVoucherFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cartItems.length === 0) {
      setError('El carrito está vacío.');
      return;
    }
    
    if (!formData.name || !formData.email) {
      setError('El nombre y el correo electrónico son campos obligatorios.');
      return;
    }

    const hasPaidItems = cartItems.some(item => !item.isFree);
    
    if (hasPaidItems && !voucherFile && !transactionId) {
      setError('Por favor sube tu comprobante de pago o proporciona un ID de transacción.');
      return;
    }

    setLoading(true);

    try {
      let paymentReceiptUrl = '';
      
      // 1. Subir voucher si existe
      if (voucherFile) {
        const uploadResult = await apiUpload(voucherFile);
        paymentReceiptUrl = uploadResult.fileUrl;
      }

      // 2. Crear pedido en el backend
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone || null,
        paymentMethodId: activePaymentId,
        paymentReceiptUrl: paymentReceiptUrl || null,
        paymentReferenceId: transactionId || null,
        items: cartItems.map(item => item.id),
      };

      const response = await apiPost('/orders', orderPayload);
      setOrderCode(response.orderCode);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const activeMethod = paymentMethods.find(pm => pm.id === activePaymentId);

  if (submitted) {
    return (
      <div className="checkout container" id="checkout-success">
        <div className="checkout__success glass-card">
          <div className="checkout__success-icon">✓</div>
          <h2>¡Pedido recibido!</h2>
          <p>Tu pedido <strong>{orderCode}</strong> ha sido registrado exitosamente.</p>
          <p className="checkout__success-sub">Revisaremos tu comprobante de pago y te enviaremos los enlaces directos de descarga de MEGA por correo una vez que sea aprobado.</p>
          <Link href="/home" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout container" id="checkout-page">
      <h1 className="checkout__title">Checkout</h1>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="checkout__grid">
        {/* Left: Form + Payment */}
        <div className="checkout__form-col">
          {/* Customer Info */}
          <div className="checkout__section glass-card">
            <h2 className="checkout__section-title">
              <span className="checkout__section-num">1</span>
              Tus datos
            </h2>
            <div className="checkout__fields">
              <div className="checkout__field">
                <label>Nombre completo *</label>
                <input 
                  type="text" 
                  placeholder="Tu nombre" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="checkout__field">
                <label>Email *</label>
                <input 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
              </div>
              <div className="checkout__field">
                <label>WhatsApp (opcional)</label>
                <input 
                  type="tel" 
                  placeholder="+51 999 888 777" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="checkout__section glass-card">
            <h2 className="checkout__section-title">
              <span className="checkout__section-num">2</span>
              Método de pago
            </h2>

            {loadingMethods ? (
              <p style={{ color: 'var(--color-text-muted)', padding: '20px 0' }}>Cargando métodos de pago...</p>
            ) : (
              <>
                <div className="checkout__payment-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      className={`checkout__payment-tab ${activePaymentId === pm.id ? 'active' : ''}`}
                      onClick={() => setActivePaymentId(pm.id)}
                      style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="checkout__payment-tab-icon" style={{ fontSize: '1.5rem' }}>
                        {pm.type === 'qr' ? '📱' : pm.type === 'link' ? '💳' : '🏦'}
                      </span>
                      {pm.name}
                    </button>
                  ))}
                </div>

                {activeMethod && (
                  <div className="checkout__payment-content">
                    <div style={{ marginBottom: '20px' }}>
                      <p className="checkout__payment-instructions" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-light)', marginBottom: '16px', lineHeight: '1.5' }}>
                        {activeMethod.details}
                      </p>

                      {activeMethod.type === 'qr' && activeMethod.qrImageUrl && (
                        <div className="checkout__payment-qr" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', maxWidth: '200px' }}>
                            <img 
                              src={resolveImageUrl(activeMethod.qrImageUrl)} 
                              alt={`QR de pago ${activeMethod.name}`} 
                              style={{ width: '100%', height: 'auto', display: 'block' }} 
                            />
                            <small style={{ color: '#333', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>Escanea con tu app</small>
                          </div>
                        </div>
                      )}

                      {activeMethod.type === 'link' && activeMethod.linkUrl && (
                        <div style={{ marginBottom: '20px' }}>
                          <a 
                            href={activeMethod.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-secondary btn-lg checkout__paypal-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            <span>💳</span>
                            Ir a pagar con {activeMethod.name}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Transaction Reference ID Input for Payment Methods */}
                    <div className="checkout__field" style={{ marginBottom: '20px' }}>
                      <label>ID o Referencia de transacción (opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ej: TXN-92837498" 
                        value={transactionId} 
                        onChange={(e) => setTransactionId(e.target.value)} 
                      />
                    </div>

                    {/* Image Voucher Upload (Always visible for all payment methods as requested) */}
                    <div className="checkout__field">
                      <label>Sube tu captura de comprobante de pago *</label>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                      
                      <div 
                        className="checkout__upload-area"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        style={{ cursor: 'pointer', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '24px', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }}
                      >
                        {voucherPreview ? (
                          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '200px' }}>
                            <img 
                              src={voucherPreview} 
                              alt="Vista previa del comprobante" 
                              style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                            <div style={{ marginTop: '8px', color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                              Comprobante seleccionado ({voucherFile.name})
                            </div>
                          </div>
                        ) : (
                          <>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17,8 12,3 7,8" />
                              <line x1="12" x2="12" y1="3" y2="15" />
                            </svg>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Arrastra tu captura aquí o <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>selecciona un archivo</span></p>
                            <small style={{ color: 'var(--color-text-muted)' }}>Formatos JPG, PNG, WEBP — máx 5MB</small>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-primary btn-lg checkout__submit" 
            id="submit-order" 
            onClick={handleSubmit}
            disabled={loading || cartItems.length === 0}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <div style={{ border: '2px solid rgba(255,255,255,0.2)', borderLeftColor: '#fff', borderRadius: '50%', width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                Procesando pedido...
              </>
            ) : (
              `Enviar pedido — S/ ${subtotal.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Right: Cart Summary */}
        <div className="checkout__summary-col">
          <div className="checkout__summary glass-card">
            <h2 className="checkout__section-title">Resumen del pedido</h2>

            <div className="checkout__cart-items">
              {cartItems.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '20px 0', textAlign: 'center' }}>Tu carrito está vacío.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="checkout__cart-item">
                    <img 
                      src={resolveImageUrl(item.image)} 
                      alt={item.name} 
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} 
                      className="checkout__cart-item-img" 
                    />
                    <div className="checkout__cart-item-info">
                      <span className="checkout__cart-item-name">{item.name}</span>
                      <span className="checkout__cart-item-format">{item.fileFormat}</span>
                    </div>
                    <span className="checkout__cart-item-price">
                      {item.isFree ? 'Gratis' : `S/ ${item.pricePEN.toFixed(2)}`}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="checkout__summary-divider" />

            <div className="checkout__summary-row">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="checkout__summary-row checkout__summary-row--total">
              <span>Total</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

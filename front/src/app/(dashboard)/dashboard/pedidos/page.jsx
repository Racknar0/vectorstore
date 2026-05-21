'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPatch, resolveImageUrl } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function PedidosPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los pedidos de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApprove = async (id, code) => {
    const result = await Swal.fire({
      title: '¿Aprobar pedido?',
      text: `Confirmarás el pago para el pedido ${code} y se enviará un correo automático con los enlaces de MEGA.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      try {
        await apiPatch(`/orders/${id}`, { status: 'COMPLETED' });
        await Swal.fire({
          title: '¡Pedido aprobado!',
          text: 'Se han enviado los enlaces al correo del cliente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        loadOrders();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo aprobar el pedido.', 'error');
      }
    }
  };

  const handleReject = async (id, code) => {
    const { value: reason } = await Swal.fire({
      title: 'Rechazar pedido',
      input: 'text',
      inputLabel: 'Razón del rechazo (se le notificará al cliente)',
      inputPlaceholder: 'Ej: Comprobante ilegible / Monto incorrecto',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes ingresar una razón para rechazar!';
        }
      }
    });

    if (reason) {
      Swal.showLoading();
      try {
        await apiPatch(`/orders/${id}`, { status: 'REJECTED', rejectionReason: reason });
        await Swal.fire({
          title: 'Pedido rechazado',
          text: 'El estado del pedido ha cambiado a Rechazado.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        loadOrders();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo rechazar el pedido.', 'error');
      }
    }
  };

  const viewReceipt = (url, refId) => {
    if (!url) {
      Swal.fire({
        title: 'Sin comprobante',
        text: refId ? `No hay captura cargada. Referencia proporcionada: ${refId}` : 'No se cargó ningún comprobante ni referencia para esta transacción.',
        icon: 'info'
      });
      return;
    }

    const receiptUrl = resolveImageUrl(url);
    Swal.fire({
      title: 'Comprobante de Pago',
      html: `
        <div style="margin-bottom: 12px; font-weight: bold; color: var(--color-text-light);">
          ID de referencia: ${refId || 'No proporcionado'}
        </div>
        <div style="max-height: 50vh; overflow-y: auto;">
          <img src="${receiptUrl}" style="width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" alt="Comprobante" />
        </div>
      `,
      confirmButtonText: 'Cerrar',
      width: '500px',
    });
  };

  const filtered = filter === 'all' 
    ? orders 
    : orders.filter((o) => {
        if (filter === 'pending') return o.status === 'PENDING';
        if (filter === 'approved') return o.status === 'COMPLETED';
        if (filter === 'rejected') return o.status === 'REJECTED';
        return true;
      });

  const statusLabel = { PENDING: 'Pendiente', COMPLETED: 'Aprobado', REJECTED: 'Rechazado' };
  const statusBadge = { PENDING: 'warning', COMPLETED: 'success', REJECTED: 'danger' };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando listado de pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-pedidos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="dash-page-title" style={{ margin: 0 }}>Pedidos</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="dash-table-wrapper">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px' }}>
                  No se encontraron pedidos.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {order.orderCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                    {order.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wsp: {order.customerPhone}</div>}
                  </td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '0.82rem' }}>
                        {item.designName} <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({item.fileFormat})</span>
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    S/ {order.totalPen.toFixed(2)}
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                      $ {order.totalUsd.toFixed(2)} USD
                    </div>
                  </td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <div>
                      <span className={`badge badge-${statusBadge[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </div>
                    {order.status === 'REJECTED' && order.rejectionReason && (
                      <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>
                        Motivo: {order.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="dash-actions">
                      {order.status === 'PENDING' && (
                        <>
                          <button 
                            className="dash-action-btn dash-action-btn--approve"
                            onClick={() => handleApprove(order.id, order.orderCode)}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="dash-action-btn dash-action-btn--reject"
                            onClick={() => handleReject(order.id, order.orderCode)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      <button 
                        className="dash-action-btn dash-action-btn--edit"
                        onClick={() => viewReceipt(order.paymentReceiptUrl, order.paymentReferenceId)}
                      >
                        Comprobante
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, resolveImageUrl } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function MetodosPagoPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMethods = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/payment-methods/admin');
      setMethods(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los métodos de pago.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const openFormModal = async (pm = null) => {
    const isEdit = !!pm;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Editar Método de Pago' : 'Nuevo Método de Pago',
      html: `
        <div style="display: grid; grid-template-columns: 1fr; gap: 12px; text-align: left;">
          <div>
            <label style="display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 4px;">Nombre del Método *</label>
            <input id="swal-pm-name" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: Yape, BCP Transferencia, PayPal" value="${isEdit ? pm.name : ''}" required />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 4px;">Tipo *</label>
            <select id="swal-pm-type" class="swal2-select" style="margin: 0; width: 100%; box-sizing: border-box; background: #1f1f23; border: 1px solid #444; color: white;">
              <option value="qr" ${isEdit && pm.type === 'qr' ? 'selected' : ''}>Código QR (Yape, Plin, etc.)</option>
              <option value="link" ${isEdit && pm.type === 'link' ? 'selected' : ''}>Enlace de Pago (PayPal, Stripe, etc.)</option>
              <option value="transfer" ${isEdit && pm.type === 'transfer' ? 'selected' : ''}>Transferencia Bancaria</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 4px;">Detalles / Instrucciones *</label>
            <textarea id="swal-pm-details" class="swal2-textarea" style="margin: 0; width: 100%; height: 60px; box-sizing: border-box;" placeholder="Instrucciones para el cliente (número de cuenta, titular, etc.)..." required>${isEdit && pm.details ? pm.details : ''}</textarea>
          </div>
          <div id="swal-pm-link-container">
            <label style="display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 4px;">Enlace de Pago</label>
            <input id="swal-pm-linkUrl" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="https://..." value="${isEdit && pm.linkUrl ? pm.linkUrl : ''}" />
          </div>
          <div id="swal-pm-qr-container" style="border-top: 1px solid #444; padding-top: 12px; margin-top: 8px;">
            <label style="display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 6px;">Imagen QR</label>
            <input type="file" id="swal-pm-qr-file" style="width: 100%; font-size: 0.85rem;" accept="image/*" />
            <div id="swal-pm-qr-preview-container" style="margin-top: 8px; display: ${isEdit && pm.qrImageUrl ? 'block' : 'none'};">
              <img id="swal-pm-qr-preview" src="${isEdit && pm.qrImageUrl ? resolveImageUrl(pm.qrImageUrl) : ''}" style="max-height: 120px; border-radius: 6px; object-fit: cover;" />
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
            <input type="checkbox" id="swal-pm-isActive" style="width: 18px; height: 18px; cursor: pointer;" ${!isEdit || pm.isActive ? 'checked' : ''} />
            <label for="swal-pm-isActive" style="font-size: 0.9rem; color: #fff; cursor: pointer; user-select: none;">¿Método de pago activo?</label>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Actualizar' : 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
      didOpen: () => {
        const typeSelect = document.getElementById('swal-pm-type');
        const linkContainer = document.getElementById('swal-pm-link-container');
        const qrContainer = document.getElementById('swal-pm-qr-container');

        const toggleContainers = () => {
          const val = typeSelect.value;
          linkContainer.style.display = val === 'link' ? 'block' : 'none';
          qrContainer.style.display = val === 'qr' ? 'block' : 'none';
        };

        typeSelect.addEventListener('change', toggleContainers);
        toggleContainers();

        const fileInput = document.getElementById('swal-pm-qr-file');
        const previewContainer = document.getElementById('swal-pm-qr-preview-container');
        const previewImg = document.getElementById('swal-pm-qr-preview');

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              previewImg.src = event.target.result;
              previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: async () => {
        const name = document.getElementById('swal-pm-name').value.trim();
        const type = document.getElementById('swal-pm-type').value;
        const details = document.getElementById('swal-pm-details').value.trim();
        const linkUrl = document.getElementById('swal-pm-linkUrl').value.trim();
        const isActive = document.getElementById('swal-pm-isActive').checked;

        const fileInput = document.getElementById('swal-pm-qr-file');
        const file = fileInput.files[0];

        if (!name || !details) {
          Swal.showValidationMessage('El nombre y las instrucciones son obligatorios.');
          return false;
        }

        if (type === 'link' && !linkUrl) {
          Swal.showValidationMessage('El enlace de pago es obligatorio para el tipo Link.');
          return false;
        }

        if (type === 'qr' && !isEdit && !file) {
          Swal.showValidationMessage('Debe cargar una imagen de código QR.');
          return false;
        }

        try {
          let uploadedQrImageUrl = isEdit ? pm.qrImageUrl : null;

          if (type === 'qr' && file) {
            Swal.resetValidationMessage();
            const confirmButton = Swal.getConfirmButton();
            const originalText = confirmButton.innerText;
            confirmButton.disabled = true;
            confirmButton.innerText = 'Subiendo QR...';

            const uploadResult = await apiUpload(file);
            uploadedQrImageUrl = uploadResult.fileUrl;

            confirmButton.disabled = false;
            confirmButton.innerText = originalText;
          }

          return {
            name,
            type,
            details,
            linkUrl: type === 'link' ? linkUrl : null,
            qrImageUrl: type === 'qr' ? uploadedQrImageUrl : null,
            isActive
          };
        } catch (err) {
          Swal.showValidationMessage(`Error al guardar: ${err.message}`);
          return false;
        }
      }
    });

    if (formValues) {
      Swal.showLoading();
      try {
        if (isEdit) {
          await apiPut(`/payment-methods/${pm.id}`, formValues);
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El método de pago fue modificado exitosamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await apiPost('/payment-methods', formValues);
          Swal.fire({
            title: '¡Creado!',
            text: 'El método de pago fue registrado exitosamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
        loadMethods();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo guardar el método de pago.', 'error');
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar método de pago?',
      text: `Eliminarás el método de pago "${name}". Esta acción no se puede deshacer y fallará si tiene compras asociadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      try {
        await apiDelete(`/payment-methods/${id}`);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El método de pago fue borrado del sistema.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadMethods();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo eliminar el método de pago.', 'error');
      }
    }
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'qr': return '📱';
      case 'link': return '🔗';
      case 'transfer': return '🏦';
      default: return '💵';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-metodos-pago">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="dash-page-title" style={{ margin: 0 }}>Métodos de Pago</h2>
        <button className="btn btn-primary" onClick={() => openFormModal()}>+ Agregar método</button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {methods.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No hay métodos de pago registrados.
            </p>
          </div>
        ) : (
          methods.map((pm) => (
            <div key={pm.id} className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '1.8rem'
              }}>
                {getMethodIcon(pm.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{pm.name}</span>
                  <span className={`badge ${pm.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {pm.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="badge badge-purple">{pm.type.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{pm.details}</p>
                {pm.type === 'link' && pm.linkUrl && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                    <a href={pm.linkUrl} target="_blank" rel="noopener noreferrer">{pm.linkUrl}</a>
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {pm.type === 'qr' && (
                  pm.qrImageUrl ? (
                    <img 
                      src={resolveImageUrl(pm.qrImageUrl)} 
                      alt={`QR ${pm.name}`} 
                      style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 'var(--radius-md)', background: '#fff', padding: 4 }} 
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg-tertiary)',
                      border: '1px dashed var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      Sin QR<br />subido
                    </div>
                  )
                )}
              </div>

              <div className="dash-actions" style={{ flexDirection: 'column' }}>
                <button className="dash-action-btn dash-action-btn--edit" onClick={() => openFormModal(pm)}>Editar</button>
                <button className="dash-action-btn dash-action-btn--delete" onClick={() => handleDelete(pm.id, pm.name)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="glass-card" style={{ padding: 40, textAlign: 'center', marginTop: 32, borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Agrega nuevos métodos de pago que aparecerán en el checkout
        </p>
        <button className="btn btn-outline" onClick={() => openFormModal()}>
          + Agregar método de pago
        </button>
      </div>
    </div>
  );
}

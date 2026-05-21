'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, resolveImageUrl } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function DisenosPage() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [designsData, categoriesData] = await Promise.all([
        apiGet('/designs/admin'),
        apiGet('/categories')
      ]);
      setDesigns(designsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openFormModal = async (design = null) => {
    const isEdit = !!design;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Editar Diseño' : 'Nuevo Diseño',
      width: '650px',
      html: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; max-width: 100%;">
          <div style="grid-column: span 2;">
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Nombre del Diseño *</label>
            <input id="swal-name" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: Pack Vectores Gaming" value="${isEdit ? design.name : ''}" required />
          </div>
          <div style="grid-column: span 2;">
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Descripción</label>
            <textarea id="swal-description" class="swal2-textarea" style="margin: 0; width: 100%; height: 60px; box-sizing: border-box;" placeholder="Detalles del diseño...">${isEdit && design.description ? design.description : ''}</textarea>
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Categoría *</label>
            <select id="swal-categoryId" class="swal2-select" style="margin: 0; width: 100%; box-sizing: border-box; background: #1f1f23; border: 1px solid #444; color: white;">
              ${categories.map(c => `<option value="${c.id}" ${isEdit && design.categoryId === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Formato de Archivo *</label>
            <input id="swal-fileFormat" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: EPS, AI, PDF" value="${isEdit ? design.fileFormat : ''}" required />
          </div>
          <div style="grid-column: span 2;">
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">MEGA URL (Enlace de Descarga) *</label>
            <input id="swal-megaUrl" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="https://mega.nz/file/..." value="${isEdit ? design.megaUrl : ''}" required />
          </div>
          
          <div style="grid-column: span 2; display: flex; align-items: center; gap: 8px; margin: 8px 0;">
            <input type="checkbox" id="swal-isFree" style="width: 18px; height: 18px; cursor: pointer;" ${isEdit && design.isFree ? 'checked' : ''} />
            <label for="swal-isFree" style="font-size: 0.9rem; color: #fff; cursor: pointer; user-select: none;">¿Es un diseño gratuito?</label>
          </div>
          
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Precio PEN (S/)</label>
            <input type="number" step="0.01" min="0" id="swal-pricePen" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: 15.00" value="${isEdit ? design.pricePen : ''}" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Precio Descuento PEN (S/)</label>
            <input type="number" step="0.01" min="0" id="swal-pricePenDiscount" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: 10.00" value="${isEdit && design.pricePenDiscount !== null ? design.pricePenDiscount : ''}" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Precio USD ($)</label>
            <input type="number" step="0.01" min="0" id="swal-priceUsd" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: 4.90" value="${isEdit ? design.priceUsd : ''}" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 4px;">Precio Descuento USD ($)</label>
            <input type="number" step="0.01" min="0" id="swal-priceUsdDiscount" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" placeholder="Ej: 2.90" value="${isEdit && design.priceUsdDiscount !== null ? design.priceUsdDiscount : ''}" />
          </div>

          <div style="grid-column: span 2; margin-top: 10px; border-top: 1px solid #444; padding-top: 12px;">
            <label style="display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 6px;">Imagen de Mockup *</label>
            <input type="file" id="swal-image-file" style="width: 100%; font-size: 0.85rem;" accept="image/*" />
            <div id="swal-image-preview-container" style="margin-top: 8px; display: ${isEdit && design.imageUrl ? 'block' : 'none'};">
              <img id="swal-image-preview" src="${isEdit && design.imageUrl ? resolveImageUrl(design.imageUrl) : ''}" style="max-height: 120px; border-radius: 6px; object-fit: cover;" />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Actualizar' : 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
      didOpen: () => {
        const isFreeCheckbox = document.getElementById('swal-isFree');
        const pricePenInput = document.getElementById('swal-pricePen');
        const pricePenDiscountInput = document.getElementById('swal-pricePenDiscount');
        const priceUsdInput = document.getElementById('swal-priceUsd');
        const priceUsdDiscountInput = document.getElementById('swal-priceUsdDiscount');

        const togglePrices = () => {
          const isFree = isFreeCheckbox.checked;
          pricePenInput.disabled = isFree;
          pricePenDiscountInput.disabled = isFree;
          priceUsdInput.disabled = isFree;
          priceUsdDiscountInput.disabled = isFree;
          if (isFree) {
            pricePenInput.value = '0';
            pricePenDiscountInput.value = '';
            priceUsdInput.value = '0';
            priceUsdDiscountInput.value = '';
          }
        };

        isFreeCheckbox.addEventListener('change', togglePrices);
        togglePrices();

        const fileInput = document.getElementById('swal-image-file');
        const previewContainer = document.getElementById('swal-image-preview-container');
        const previewImg = document.getElementById('swal-image-preview');

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
        const name = document.getElementById('swal-name').value.trim();
        const description = document.getElementById('swal-description').value.trim();
        const categoryId = document.getElementById('swal-categoryId').value;
        const fileFormat = document.getElementById('swal-fileFormat').value.trim();
        const megaUrl = document.getElementById('swal-megaUrl').value.trim();
        const isFree = document.getElementById('swal-isFree').checked;

        const pricePen = document.getElementById('swal-pricePen').value;
        const pricePenDiscount = document.getElementById('swal-pricePenDiscount').value;
        const priceUsd = document.getElementById('swal-priceUsd').value;
        const priceUsdDiscount = document.getElementById('swal-priceUsdDiscount').value;

        const fileInput = document.getElementById('swal-image-file');
        const file = fileInput.files[0];

        if (!name || !categoryId || !fileFormat || !megaUrl) {
          Swal.showValidationMessage('Todos los campos marcados con * son obligatorios.');
          return false;
        }

        if (!isFree) {
          if (!pricePen || parseFloat(pricePen) < 0 || !priceUsd || parseFloat(priceUsd) < 0) {
            Swal.showValidationMessage('Los precios base en PEN y USD son obligatorios y deben ser mayores o iguales a 0.');
            return false;
          }
        }

        if (!isEdit && !file) {
          Swal.showValidationMessage('Debe cargar una imagen de mockup.');
          return false;
        }

        try {
          let uploadedImageUrl = isEdit ? design.imageUrl : '';
          
          if (file) {
            Swal.resetValidationMessage();
            const confirmButton = Swal.getConfirmButton();
            const originalText = confirmButton.innerText;
            confirmButton.disabled = true;
            confirmButton.innerText = 'Subiendo imagen...';

            const uploadResult = await apiUpload(file);
            uploadedImageUrl = uploadResult.fileUrl;

            confirmButton.disabled = false;
            confirmButton.innerText = originalText;
          }

          return {
            categoryId: parseInt(categoryId),
            name,
            description,
            pricePen: isFree ? 0 : parseFloat(pricePen),
            pricePenDiscount: isFree || !pricePenDiscount ? null : parseFloat(pricePenDiscount),
            priceUsd: isFree ? 0 : parseFloat(priceUsd),
            priceUsdDiscount: isFree || !priceUsdDiscount ? null : parseFloat(priceUsdDiscount),
            imageUrl: uploadedImageUrl,
            fileFormat,
            isFree,
            megaUrl
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
          await apiPut(`/designs/${design.id}`, formValues);
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El diseño se modificó con éxito.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          await apiPost('/designs', formValues);
          Swal.fire({
            title: '¡Creado!',
            text: 'El diseño fue registrado exitosamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
        loadData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo guardar el diseño.', 'error');
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar diseño?',
      text: `Eliminarás el diseño "${name}". Esta acción no se puede deshacer y fallará si tiene compras asociadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      try {
        await apiDelete(`/designs/${id}`);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El diseño fue borrado del sistema.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo eliminar el diseño.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando diseños...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-disenos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="dash-page-title" style={{ margin: 0 }}>Diseños</h2>
        <button className="btn btn-primary" onClick={() => openFormModal()}>+ Nuevo diseño</button>
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
              <th>Diseño</th>
              <th>Categoría</th>
              <th>Precio PEN</th>
              <th>Precio USD</th>
              <th>Formato</th>
              <th>Descargas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {designs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                  No hay diseños registrados.
                </td>
              </tr>
            ) : (
              designs.map((design) => (
                <tr key={design.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={resolveImageUrl(design.imageUrl)} 
                        alt={design.name} 
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} 
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{design.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{design.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">
                      {design.category ? `${design.category.icon} ${design.category.name}` : 'Sin categoría'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {design.isFree ? (
                      <span style={{ color: 'var(--accent-green)' }}>Gratis</span>
                    ) : (
                      <div>
                        {design.pricePenDiscount !== null ? (
                          <>
                            <span style={{ color: 'var(--accent-green)' }}>S/ {design.pricePenDiscount.toFixed(2)}</span>
                            <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)' }}>S/ {design.pricePen.toFixed(2)}</div>
                          </>
                        ) : (
                          <span>S/ {design.pricePen.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {design.isFree ? (
                      <span style={{ color: 'var(--accent-green)' }}>Gratis</span>
                    ) : (
                      <div>
                        {design.priceUsdDiscount !== null ? (
                          <>
                            <span style={{ color: 'var(--accent-cyan)' }}>$ {design.priceUsdDiscount.toFixed(2)}</span>
                            <div style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)' }}>$ {design.priceUsd.toFixed(2)}</div>
                          </>
                        ) : (
                          <span>$ {design.priceUsd.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{design.fileFormat}</td>
                  <td>{design.downloadCount}</td>
                  <td>
                    {design.isFree ? (
                      <span className="badge badge-cyan">Gratuito</span>
                    ) : (
                      <span className="badge badge-success">De Pago</span>
                    )}
                  </td>
                  <td>
                    <div className="dash-actions">
                      <button className="dash-action-btn dash-action-btn--edit" onClick={() => openFormModal(design)}>Editar</button>
                      <button className="dash-action-btn dash-action-btn--delete" onClick={() => handleDelete(design.id, design.name)}>Eliminar</button>
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

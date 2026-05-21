'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, resolveImageUrl } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function DisenosPage() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [designsData, categoriesData] = await Promise.all([
        apiGet('/designs/admin'),
        apiGet('/categories')
      ]);
      setDesigns(designsData);
      setCategories(categoriesData);
      setImageErrors({});
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  const openFormModal = async (design = null) => {
    const isEdit = !!design;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Editar Diseño' : 'Nuevo Diseño',
      width: '950px',
      html: `
        <div class="swal-scroll-container">
          <div class="swal-grid">
            <div class="swal-col-8">
              <label class="swal-label">Nombre del Diseño *</label>
              <input id="swal-name" class="swal-input-custom" placeholder="Ej: Pack Vectores Gaming" value="${isEdit ? design.name : ''}" required />
            </div>
            
            <div class="swal-col-4">
              <label class="swal-label">Categoría *</label>
              <select id="swal-categoryId" class="swal-input-custom" style="padding: 0 10px;">
                ${categories.map(c => `<option value="${c.id}" ${isEdit && design.categoryId === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="swal-col-12">
              <label class="swal-label">Descripción</label>
              <textarea id="swal-description" class="swal-textarea-custom" placeholder="Detalles del diseño...">${isEdit && design.description ? design.description : ''}</textarea>
            </div>
            
            <div class="swal-col-9">
              <label class="swal-label">MEGA URL (Enlace de Descarga) *</label>
              <input id="swal-megaUrl" class="swal-input-custom" placeholder="https://mega.nz/file/..." value="${isEdit ? design.megaUrl : ''}" required />
            </div>

            <div class="swal-col-3">
              <label class="swal-label">Formato de Archivo *</label>
              <input id="swal-fileFormat" class="swal-input-custom" placeholder="Ej: EPS, AI, PDF" value="${isEdit ? design.fileFormat : ''}" required />
            </div>

            <div class="swal-col-12">
              <label class="swal-label">Etiquetas (Separadas por comas)</label>
              <input id="swal-tags" class="swal-input-custom" placeholder="Ej: futbol, barcelona, champions" value="${isEdit && design.tags ? design.tags.map(t => t.name).join(', ') : ''}" />
            </div>
            
            <div class="swal-col-12 swal-checkbox-container">
              <input type="checkbox" id="swal-isFree" style="width: 16px; height: 16px; cursor: pointer;" ${isEdit && design.isFree ? 'checked' : ''} />
              <label for="swal-isFree" class="swal-checkbox-label">¿Es un diseño gratuito?</label>
            </div>
            
            <div class="swal-col-3">
              <label class="swal-label">Precio PEN (S/)</label>
              <input type="number" step="0.01" min="0" id="swal-pricePen" class="swal-input-custom" placeholder="Ej: 15.00" value="${isEdit ? design.pricePen : ''}" />
            </div>
            <div class="swal-col-3">
              <label class="swal-label">Precio Descuento PEN (S/)</label>
              <input type="number" step="0.01" min="0" id="swal-pricePenDiscount" class="swal-input-custom" placeholder="Ej: 10.00" value="${isEdit && design.pricePenDiscount !== null ? design.pricePenDiscount : ''}" />
            </div>
            <div class="swal-col-3">
              <label class="swal-label">Precio USD ($)</label>
              <input type="number" step="0.01" min="0" id="swal-priceUsd" class="swal-input-custom" placeholder="Ej: 4.90" value="${isEdit ? design.priceUsd : ''}" />
            </div>
            <div class="swal-col-3">
              <label class="swal-label">Precio Descuento USD ($)</label>
              <input type="number" step="0.01" min="0" id="swal-priceUsdDiscount" class="swal-input-custom" placeholder="Ej: 2.90" value="${isEdit && design.priceUsdDiscount !== null ? design.priceUsdDiscount : ''}" />
            </div>

            <div class="swal-divider"></div>

            <div class="swal-mockup-wrapper">
              <div>
                <label class="swal-label" style="color: #ffffff; font-weight: 600; margin-bottom: 6px;">Imagen de Mockup *</label>
                <span class="swal-label" style="margin-bottom: 8px;">Carga una imagen representativa para la tienda (PNG, JPG o WebP)</span>
                <input type="file" id="swal-image-file" class="swal-file-custom" accept="image/*" />
              </div>
              <div style="display: flex; justify-content: center; align-items: center;">
                <div id="swal-image-preview-container" style="display: ${isEdit && design.imageUrl ? 'block' : 'none'}; width: 100%; text-align: center;">
                  <img id="swal-image-preview" src="${isEdit && design.imageUrl ? resolveImageUrl(design.imageUrl) : ''}" onerror="this.src='/default_placeholder.png';" style="max-height: 120px; max-width: 100%; border-radius: 6px; object-fit: contain; border: 1px solid #3f3f46;" />
                </div>
              </div>
            </div>

            <div class="swal-divider"></div>

            <div class="swal-col-12" style="background: #202024; padding: 12px; border-radius: 8px; border: 1px dashed #3f3f46;">
              <label class="swal-label" style="color: #ffffff; font-weight: 600; margin-bottom: 6px;">Galería de Imágenes Adicionales</label>
              <span class="swal-label" style="margin-bottom: 8px;">Carga múltiples fotos para el carrusel de la tienda (puedes seleccionar varias a la vez)</span>
              <input type="file" id="swal-gallery-files" class="swal-file-custom" accept="image/*" multiple style="margin-bottom: 12px;" />
              
              <div id="swal-gallery-loading" style="display: none; font-size: 0.8rem; color: #a855f7; margin-bottom: 8px; font-weight: 500;">
                ⌛ Subiendo imágenes a la galería...
              </div>

              <div id="swal-gallery-container" class="swal-gallery-container">
                <!-- Aquí se inyectarán dinámicamente las miniaturas -->
              </div>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Actualizar' : 'Guardar',
      cancelButtonText: 'Cancelar',
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

        // --- GALERÍA MULTI-IMAGEN ---
        const galleryContainer = document.getElementById('swal-gallery-container');
        const renderGalleryItem = (url) => {
          const item = document.createElement('div');
          item.className = 'swal-gallery-item';
          item.dataset.url = url;
          item.innerHTML = `
            <img src="${resolveImageUrl(url)}" onerror="this.src='/default_placeholder.png';" />
            <button type="button" class="swal-gallery-item-remove">×</button>
          `;
          item.querySelector('.swal-gallery-item-remove').addEventListener('click', () => {
            item.remove();
          });
          galleryContainer.appendChild(item);
        };

        // Poblar galería existente en edición
        if (isEdit && design.gallery && Array.isArray(design.gallery)) {
          design.gallery.forEach(url => {
            renderGalleryItem(url);
          });
        }

        // Subida de archivos de galería
        const galleryInput = document.getElementById('swal-gallery-files');
        const galleryLoading = document.getElementById('swal-gallery-loading');

        galleryInput.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          if (files.length === 0) return;

          galleryLoading.style.display = 'block';
          const confirmBtn = Swal.getConfirmButton();
          if (confirmBtn) confirmBtn.disabled = true;

          try {
            for (const file of files) {
              const uploadRes = await apiUpload(file);
              renderGalleryItem(uploadRes.fileUrl);
            }
          } catch (err) {
            Swal.showValidationMessage(`Error al subir imagen de galería: ${err.message}`);
          } finally {
            galleryLoading.style.display = 'none';
            if (confirmBtn) confirmBtn.disabled = false;
            galleryInput.value = ''; // Limpiar input para permitir relanzar
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
        const tagsInput = document.getElementById('swal-tags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

        const pricePen = document.getElementById('swal-pricePen').value;
        const pricePenDiscount = document.getElementById('swal-pricePenDiscount').value;
        const priceUsd = document.getElementById('swal-priceUsd').value;
        const priceUsdDiscount = document.getElementById('swal-priceUsdDiscount').value;

        const fileInput = document.getElementById('swal-image-file');
        const file = fileInput.files[0];

        // Obtener URLs de la galería del DOM
        const galleryItems = Array.from(document.querySelectorAll('.swal-gallery-item'));
        const gallery = galleryItems.map(item => item.dataset.url);

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
            gallery,
            fileFormat,
            isFree,
            megaUrl,
            tags
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
      customClass: {
        confirmButton: 'swal-btn-danger'
      },
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

  const openDetailModal = (design) => {
    const gallery = design.gallery && Array.isArray(design.gallery) ? design.gallery : [];
    const allImages = [design.imageUrl, ...gallery].filter(Boolean);

    Swal.fire({
      title: 'Detalle del Diseño',
      width: '900px',
      html: `
        <div class="swal-detail-container">
          <!-- Columna izquierda: Media -->
          <div class="swal-detail-media">
            <div class="swal-detail-main-img-wrapper">
              <img id="swal-detail-main-image" class="swal-detail-main-img" src="${resolveImageUrl(design.imageUrl)}" onerror="this.src='/default_placeholder.png';" alt="${design.name}" />
            </div>
            ${allImages.length > 1 ? `
              <div class="swal-detail-thumbs">
                ${allImages.map((imgUrl, idx) => `
                  <img class="swal-detail-thumb ${idx === 0 ? 'active' : ''}" src="${resolveImageUrl(imgUrl)}" onerror="this.src='/default_placeholder.png';" data-index="${idx}" />
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Columna derecha: Detalles -->
          <div class="swal-detail-info">
            <div class="swal-detail-header">
              <h3 class="swal-detail-title">${design.name}</h3>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-purple swal-detail-category-badge" style="margin: 0;">
                  ${design.category ? `${design.category.icon} ${design.category.name}` : 'Sin categoría'}
                </span>
                ${design.tags && design.tags.length > 0 ? design.tags.map(t => `<span class="badge badge-purple" style="font-size: 0.72rem; padding: 4px 10px; opacity: 0.85; border: 1px solid rgba(255,255,255,0.08); background: rgba(168, 85, 247, 0.15); backdrop-filter: blur(4px);"># ${t.name}</span>`).join('') : ''}
              </div>
            </div>

            <div class="swal-detail-description">
              ${design.description ? design.description.replace(/\n/g, '<br/>') : '<em style="color: var(--text-muted);">Sin descripción.</em>'}
            </div>

            <table class="swal-detail-meta-table">
              <tr class="swal-detail-meta-row">
                <td class="swal-detail-meta-label">Formato de Archivo:</td>
                <td class="swal-detail-meta-value">${design.fileFormat || 'No especificado'}</td>
              </tr>
              <tr class="swal-detail-meta-row">
                <td class="swal-detail-meta-label">Descargas:</td>
                <td class="swal-detail-meta-value">${design.downloadCount || 0} veces</td>
              </tr>
              <tr class="swal-detail-meta-row">
                <td class="swal-detail-meta-label">Slug único:</td>
                <td class="swal-detail-meta-value">${design.slug}</td>
              </tr>
            </table>

            <div class="swal-detail-price-box">
              <div class="swal-detail-price-item">
                <span class="swal-detail-price-currency">Precio PEN</span>
                ${design.isFree ? `
                  <span class="swal-detail-price-value" style="color: var(--accent-green);">Gratis</span>
                ` : `
                  ${design.pricePenDiscount !== null ? `
                    <span class="swal-detail-price-original">S/ ${design.pricePen.toFixed(2)}</span>
                    <span class="swal-detail-price-value" style="color: var(--accent-green);">S/ ${design.pricePenDiscount.toFixed(2)}</span>
                  ` : `
                    <span class="swal-detail-price-value">S/ ${design.pricePen.toFixed(2)}</span>
                  `}
                `}
              </div>
              <div class="swal-detail-price-item">
                <span class="swal-detail-price-currency">Precio USD</span>
                ${design.isFree ? `
                  <span class="swal-detail-price-value" style="color: var(--accent-green);">Gratis</span>
                ` : `
                  ${design.priceUsdDiscount !== null ? `
                    <span class="swal-detail-price-original">$ ${design.priceUsd.toFixed(2)}</span>
                    <span class="swal-detail-price-value" style="color: var(--accent-cyan);">$ ${design.priceUsdDiscount.toFixed(2)}</span>
                  ` : `
                    <span class="swal-detail-price-value">$ ${design.priceUsd.toFixed(2)}</span>
                  `}
                `}
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Descargar (MEGA)',
      cancelButtonText: 'Cerrar',
      focusConfirm: false,
      didOpen: () => {
        const mainImage = document.getElementById('swal-detail-main-image');
        const thumbs = document.querySelectorAll('.swal-detail-thumb');
        thumbs.forEach(thumb => {
          thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            mainImage.src = thumb.src;
          });
        });
      },
      preConfirm: () => {
        if (design.megaUrl) {
          window.open(design.megaUrl, '_blank');
        } else {
          Swal.showValidationMessage('Este diseño no cuenta con enlace de descarga.');
          return false;
        }
        return true;
      }
    });
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
                      {(!design.imageUrl || imageErrors[design.id]) ? (
                        <div style={{ 
                          width: 132, 
                          height: 132, 
                          borderRadius: 8, 
                          backgroundColor: '#2d2d34', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#8b8b93',
                          border: '1px solid rgba(255,255,255,0.1)',
                          flexShrink: 0,
                          cursor: 'pointer'
                        }} 
                        onClick={() => openDetailModal(design)}
                        title="Ver detalle del diseño">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      ) : (
                        <img 
                          src={resolveImageUrl(design.imageUrl)} 
                          alt={design.name} 
                          style={{ width: 132, height: 132, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} 
                          onClick={() => openDetailModal(design)}
                          onError={() => {
                            setImageErrors(prev => ({ ...prev, [design.id]: true }));
                          }}
                          title="Ver detalle del diseño"
                        />
                      )}
                      <div>
                        <div 
                          style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} 
                          className="hover-underline"
                          onClick={() => openDetailModal(design)}
                          title="Ver detalle del diseño"
                        >
                          {design.name}
                        </div>
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

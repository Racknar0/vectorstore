'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete, apiPut } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function EtiquetasPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/tags');
      setTags(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las etiquetas del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadTags();
    });
  }, []);

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Nueva Etiqueta',
      width: '500px',
      html: `
        <div class="swal-scroll-container">
          <div class="swal-grid">
            <div class="swal-col-12">
              <label class="swal-label">Nombre de la Etiqueta *</label>
              <input id="swal-tag-name" class="swal-input-custom" placeholder="Ej: retro, neon, anime" required />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = document.getElementById('swal-tag-name').value.trim();
        if (!name) {
          Swal.showValidationMessage('El nombre es obligatorio.');
          return false;
        }
        return { name };
      }
    });

    if (formValues) {
      Swal.showLoading();
      try {
        await apiPost('/tags', formValues);
        Swal.fire({
          title: '¡Creada!',
          text: 'La etiqueta fue registrada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadTags();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo crear la etiqueta.', 'error');
      }
    }
  };

  const handleEdit = async (tag) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Etiqueta',
      width: '500px',
      html: `
        <div class="swal-scroll-container">
          <div class="swal-grid">
            <div class="swal-col-12">
              <label class="swal-label">Nombre de la Etiqueta *</label>
              <input id="swal-tag-name" class="swal-input-custom" value="${tag.name}" placeholder="Ej: retro, neon, anime" required />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = document.getElementById('swal-tag-name').value.trim();
        if (!name) {
          Swal.showValidationMessage('El nombre es obligatorio.');
          return false;
        }
        return { name };
      }
    });

    if (formValues) {
      Swal.showLoading();
      try {
        await apiPut(`/tags/${tag.id}`, formValues);
        Swal.fire({
          title: '¡Actualizada!',
          text: 'La etiqueta fue modificada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadTags();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo actualizar la etiqueta.', 'error');
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar etiqueta?',
      text: `Eliminarás la etiqueta "${name}". Se desvinculará de todos los diseños asociados automáticamente.`,
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
        await apiDelete(`/tags/${id}`);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La etiqueta fue borrada del sistema.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadTags();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo eliminar la etiqueta.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando etiquetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-etiquetas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="dash-page-title" style={{ margin: 0 }}>Etiquetas (Tags)</h2>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nueva etiqueta</button>
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
              <th>ID</th>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Diseños Vinculados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                  No hay etiquetas registradas.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id}>
                  <td>{tag.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                      # {tag.name}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{tag.slug}</td>
                  <td>{tag.designCount}</td>
                  <td>
                    <div className="dash-actions">
                      <button className="dash-action-btn dash-action-btn--edit" onClick={() => handleEdit(tag)}>Editar</button>
                      <button className="dash-action-btn dash-action-btn--delete" onClick={() => handleDelete(tag.id, tag.name)}>Eliminar</button>
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

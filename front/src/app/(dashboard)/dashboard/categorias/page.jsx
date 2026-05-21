'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/helpers/api';
import Swal from 'sweetalert2';

export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las categorías del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadCategories();
    });
  }, []);

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Nueva Categoría',
      width: '500px',
      html: `
        <div class="swal-scroll-container">
          <div class="swal-grid">
            <div class="swal-col-12">
              <label class="swal-label">Nombre de la Categoría *</label>
              <input id="swal-cat-name" class="swal-input-custom" placeholder="Ej: Gaming" required />
            </div>
            <div class="swal-col-12">
              <label class="swal-label">Icono (Emoji) *</label>
              <input id="swal-cat-icon" class="swal-input-custom" placeholder="Ej: 🎮" required />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = document.getElementById('swal-cat-name').value.trim();
        const icon = document.getElementById('swal-cat-icon').value.trim();
        if (!name || !icon) {
          Swal.showValidationMessage('Todos los campos son obligatorios.');
          return false;
        }
        return { name, icon };
      }
    });

    if (formValues) {
      Swal.showLoading();
      try {
        await apiPost('/categories', formValues);
        Swal.fire({
          title: '¡Creada!',
          text: 'La categoría fue registrada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadCategories();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo crear la categoría.', 'error');
      }
    }
  };

  const handleEdit = async (cat) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Categoría',
      width: '500px',
      html: `
        <div class="swal-scroll-container">
          <div class="swal-grid">
            <div class="swal-col-12">
              <label class="swal-label">Nombre de la Categoría *</label>
              <input id="swal-cat-name" class="swal-input-custom" value="${cat.name}" placeholder="Ej: Gaming" required />
            </div>
            <div class="swal-col-12">
              <label class="swal-label">Icono (Emoji) *</label>
              <input id="swal-cat-icon" class="swal-input-custom" value="${cat.icon}" placeholder="Ej: 🎮" required />
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = document.getElementById('swal-cat-name').value.trim();
        const icon = document.getElementById('swal-cat-icon').value.trim();
        if (!name || !icon) {
          Swal.showValidationMessage('Todos los campos son obligatorios.');
          return false;
        }
        return { name, icon };
      }
    });

    if (formValues) {
      Swal.showLoading();
      try {
        await apiPut(`/categories/${cat.id}`, formValues);
        Swal.fire({
          title: '¡Actualizada!',
          text: 'La categoría fue modificada exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadCategories();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo actualizar la categoría.', 'error');
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Eliminarás la categoría "${name}". Esta acción no se puede deshacer y fallará si tiene diseños asociados.`,
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
        await apiDelete(`/categories/${id}`);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La categoría fue borrada del sistema.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadCategories();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo eliminar la categoría.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-categorias">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="dash-page-title" style={{ margin: 0 }}>Categorías</h2>
        <button className="btn btn-primary" onClick={handleCreate}>+ Nueva categoría</button>
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
              <th>Icono</th>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Diseños</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.slug}</td>
                  <td>{cat.count}</td>
                  <td>
                    <div className="dash-actions">
                      <button className="dash-action-btn dash-action-btn--edit" onClick={() => handleEdit(cat)}>Editar</button>
                      <button className="dash-action-btn dash-action-btn--delete" onClick={() => handleDelete(cat.id, cat.name)}>Eliminar</button>
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

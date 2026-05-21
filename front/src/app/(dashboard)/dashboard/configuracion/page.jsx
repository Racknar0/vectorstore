export default function ConfiguracionPage() {
  return (
    <div id="dashboard-configuracion">
      <h2 className="dash-page-title">Configuración</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* General */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>Información General</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nombre de la tienda</label>
              <input type="text" defaultValue="VectorStore" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Moneda por defecto</label>
              <select defaultValue="PEN">
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>WhatsApp de contacto</label>
              <input type="text" defaultValue="+51 999 888 777" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email de notificaciones</label>
              <input type="email" defaultValue="admin@vectorstore.com" />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>Textos del Home</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Título del Hero</label>
              <input type="text" defaultValue="Encuentra el diseño perfecto para tu equipo" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subtítulo del Hero</label>
              <textarea rows={3} defaultValue="Vectores premium de camisetas deportivas listos para personalizar. Fútbol, motocross, básquet, e-sports y más." />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>Logo de la tienda</h3>
          <div style={{
            width: 200, height: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-tertiary)', border: '2px dashed var(--border-light)',
            borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: 12
          }}>
            Subir logo
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>PNG o SVG, máximo 2MB. Se mostrará en el navbar y footer.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg">Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

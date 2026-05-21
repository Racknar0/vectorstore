'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/helpers/api';

export default function DashboardHomePage() {
  const [kpiData, setKpiData] = useState({
    salesToday: 'S/ 0.00',
    salesMonth: 'S/ 0.00',
    pendingOrders: 0,
    totalDesigns: 0,
    chartData: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [kpis, orders] = await Promise.all([
          apiGet('/orders/kpis'),
          apiGet('/orders')
        ]);
        setKpiData(kpis);
        setRecentOrders(orders.slice(0, 4));
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos del panel de administración.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando indicadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '30px', textAlign: 'center', margin: '20px auto', maxWidth: '500px' }}>
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>⚠️</span>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const kpis = [
    { label: 'Ventas del día', value: kpiData.salesToday, change: 'Hoy', gradient: true },
    { label: 'Ventas acumuladas', value: kpiData.salesMonth, change: 'Mes actual', gradient: false },
    { label: 'Pedidos pendientes', value: kpiData.pendingOrders.toString(), change: 'Por aprobar', gradient: false },
    { label: 'Diseños registrados', value: kpiData.totalDesigns.toString(), change: 'En catálogo', gradient: false },
  ];

  const chartData = kpiData.chartData.length > 0 ? kpiData.chartData : [
    { day: 'Lun', value: 0 },
    { day: 'Mar', value: 0 },
    { day: 'Mié', value: 0 },
    { day: 'Jue', value: 0 },
    { day: 'Vie', value: 0 },
    { day: 'Sáb', value: 0 },
    { day: 'Dom', value: 0 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div id="dashboard-home">
      <div className="dash-kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="dash-kpi">
            <div className="dash-kpi__label">{kpi.label}</div>
            <div className={`dash-kpi__value ${kpi.gradient ? 'dash-kpi__value--gradient' : ''}`}>
              {kpi.value}
            </div>
            {kpi.change && <div className="dash-kpi__change">{kpi.change}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="dash-chart">
          <div className="dash-chart__title">Ventas últimos 7 días</div>
          <div className="dash-chart__bars">
            {chartData.map((d, i) => (
              <div key={i} className="dash-chart__bar-col">
                <div className="dash-chart__bar" style={{ height: `${(d.value / maxValue) * 100}%` }} />
                <span className="dash-chart__bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-chart">
          <div className="dash-chart__title">Últimos pedidos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>No hay pedidos registrados.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.orderCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>S/ {order.totalPen.toFixed(2)}</div>
                    <span className={`badge badge-${order.status === 'COMPLETED' ? 'success' : order.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                      {order.status === 'COMPLETED' ? 'Aprobado' : order.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/helpers/api';
import './login.scss';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__orb login-page__orb--1" />
      <div className="login-page__orb login-page__orb--2" />

      <div className="login-page__card glass-card">
        <div className="login-page__logo">
          <span className="login-page__logo-icon">◆</span>
          <span>Vector<span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Store</span></span>
        </div>
        <h1 className="login-page__title">Panel Admin</h1>
        <p className="login-page__subtitle">Ingresa tus credenciales para acceder</p>

        {error && <div className="login-page__error" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.88rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-page__form">
          <div className="login-page__field">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="admin@vectorstore.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="login-page__field">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-page__submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}


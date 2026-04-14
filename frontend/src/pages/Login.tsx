import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar login');
      }
      
      localStorage.setItem('token', data.token);
      
      if (data.requiresPasswordChange) {
        localStorage.setItem('requiresPasswordChange', 'true');
        navigate('/change-password');
      } else {
        localStorage.removeItem('requiresPasswordChange');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>PrintManager</h1>
          <p className="text-muted">Faça login para gerenciar o sistema</p>
        </div>

        {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuário</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input-glass" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" className="input-glass" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

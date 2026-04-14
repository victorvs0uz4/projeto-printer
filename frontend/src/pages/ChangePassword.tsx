import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      // Usando request relative do Vite Proxy ou absoluto se em produção.
      const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar a senha');
      }

      // Senha alterada!
      localStorage.setItem('token', data.token);
      localStorage.removeItem('requiresPasswordChange');
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Nova Senha Obrigatória</h1>
          <p className="text-muted">Como este é seu primeiro acesso, precisamos que você defina uma nova senha.</p>
        </div>

        {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleChangePassword}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Nova Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-glass" placeholder="Nova Senha" style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Confirmar Nova Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-glass" placeholder="Repita a Senha" style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Atualizar e Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

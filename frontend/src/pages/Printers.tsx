import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface Printer {
  id: number;
  name: string;
  location: string;
  price_per_copy: number;
}

const Printers = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Printer | null>(null);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/printers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar impressoras');
      const data = await response.json();
      setPrinters(data);
    } catch (err) {
      console.error('Erro ao carregar impressoras:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPrinter(null);
    setFormName('');
    setFormLocation('');
    setFormPrice('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (printer: Printer) => {
    setEditingPrinter(printer);
    setFormName(printer.name);
    setFormLocation(printer.location || '');
    setFormPrice(String(printer.price_per_copy));
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError('O nome da fila é obrigatório.');
      return;
    }
    if (!formPrice || isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      setFormError('Informe um valor válido para o custo por cópia.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const body = {
        name: formName.trim(),
        location: formLocation.trim(),
        price_per_copy: parseFloat(formPrice)
      };

      let response: Response;

      if (editingPrinter) {
        response = await fetch(`${API_URL}/api/printers/${editingPrinter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      } else {
        response = await fetch(`${API_URL}/api/printers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar impressora');
      }

      setShowModal(false);
      fetchPrinters();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (printer: Printer) => {
    try {
      const response = await fetch(`${API_URL}/api/printers/${printer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir impressora');
      }

      setDeleteConfirm(null);
      fetchPrinters();
    } catch (err: any) {
      alert(err.message);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Filas de Impressão</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Gerenciamento e precificação de copias</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Nova Impressora
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {printers.length > 0 ? (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Nome da Fila</th>
                <th>Localização</th>
                <th>Custo / Cópia (R$)</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {printers.map(printer => (
                <tr key={printer.id}>
                  <td style={{ fontWeight: 500 }}>{printer.name}</td>
                  <td>{printer.location || '—'}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>R$ {printer.price_per_copy.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem', border: 'none', color: 'var(--text-muted)', marginRight: '0.5rem' }}
                      onClick={() => openEditModal(printer)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem', border: 'none', color: 'var(--error)' }}
                      onClick={() => setDeleteConfirm(printer)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p>Nenhuma impressora cadastrada.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Clique em "Nova Impressora" para adicionar.</p>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {editingPrinter ? 'Editar Impressora' : 'Cadastrar Impressora'}
            </h3>

            {formError && (
              <div style={{ color: '#ff4d4d', marginBottom: '1rem', background: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}

            <div className="form-group">
              <label>Nome da Fila (Exato como no CUPS)</label>
              <input
                type="text"
                className="input-glass"
                placeholder="ex: HP_LaserJet_400"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Localização</label>
              <input
                type="text"
                className="input-glass"
                placeholder="ex: RH - 2º Andar"
                value={formLocation}
                onChange={e => setFormLocation(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Custo por Cópia (R$)</label>
              <input
                type="number"
                step="0.01"
                className="input-glass"
                placeholder="0.10"
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {editingPrinter ? 'Salvar Alterações' : 'Salvar Fila'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--error)', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Confirmar Exclusão</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Tem certeza que deseja excluir a impressora <strong style={{ color: 'var(--text-main)' }}>{deleteConfirm.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button
                className="btn-primary"
                style={{ background: 'var(--error)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Printers;

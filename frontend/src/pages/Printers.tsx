import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, Info, X, Zap, Save } from 'lucide-react';

interface Printer {
  id: number;
  name: string;
  description: string;
  ip_address: string;
  device_type: string;
  manufacturer: string;
  model: string;
  is_a3: boolean;
  is_color: boolean;
  show_in_widget: boolean;
  cost_a3_bw: number;
  cost_a3_color: number;
  cost_a4_bw: number;
  cost_a4_color: number;
}

const defaultFormState = {
  name: '',
  description: '',
  ip_address: '',
  device_type: 'Rede',
  manufacturer: 'Raw',
  model: 'Raw Queue',
  is_a3: false,
  is_color: false,
  show_in_widget: true,
  cost_a3_bw: 0,
  cost_a3_color: 0,
  cost_a4_bw: 0,
  cost_a4_color: 0
};

const Printers = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Printer | null>(null);
  
  const [formData, setFormData] = useState(defaultFormState);
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
    setFormData(defaultFormState);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (printer: Printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      description: printer.description || '',
      ip_address: printer.ip_address || '',
      device_type: printer.device_type || 'Rede',
      manufacturer: printer.manufacturer || 'Raw',
      model: printer.model || 'Raw Queue',
      is_a3: !!printer.is_a3,
      is_color: !!printer.is_color,
      show_in_widget: printer.show_in_widget !== undefined ? !!printer.show_in_widget : true,
      cost_a3_bw: printer.cost_a3_bw || 0,
      cost_a3_color: printer.cost_a3_color || 0,
      cost_a4_bw: printer.cost_a4_bw || 0,
      cost_a4_color: printer.cost_a4_color || 0
    });
    setFormError('');
    setShowModal(true);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('O nome da fila virtual é obrigatório.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const body = {
        ...formData,
        cost_a3_bw: Number(formData.cost_a3_bw) || 0,
        cost_a3_color: Number(formData.cost_a3_color) || 0,
        cost_a4_bw: Number(formData.cost_a4_bw) || 0,
        cost_a4_color: Number(formData.cost_a4_color) || 0,
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
          <p className="subtitle" style={{ marginBottom: 0 }}>Gerenciamento e configuração de dispositivos</p>
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
                <th>Descrição / Local</th>
                <th>IP</th>
                <th>Custo A4 (P&B)</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {printers.map(printer => (
                <tr key={printer.id}>
                  <td style={{ fontWeight: 500 }}>{printer.name}</td>
                  <td>{printer.description || '—'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{printer.ip_address || '—'}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>R$ {(printer.cost_a4_bw || 0).toFixed(2)}</td>
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

      {/* Modal Criar/Editar estilo PrinterTux Grid */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', border: '1px solid var(--primary)', padding: '2rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <Edit2 size={24} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                {editingPrinter ? `Alterar impressora: ${editingPrinter.name}` : 'Nova impressora'}
              </h3>
            </div>

            {formError && (
              <div style={{ color: '#ff4d4d', marginBottom: '1.5rem', background: 'rgba(255, 77, 77, 0.1)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Coluna 1 */}
              <div>
                <div className="form-group">
                  <label>Nome(Fila Virtual)</label>
                  <input type="text" className="input-glass" placeholder="imp-apto" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                </div>
                
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Tipo de dispositivo</label>
                  <select className="input-glass" style={{ appearance: 'none', background: 'rgba(255,255,255,0.05)' }} value={formData.device_type} onChange={e => handleChange('device_type', e.target.value)}>
                    <option value="Rede" style={{ background: '#222' }}>Rede</option>
                    <option value="USB" style={{ background: '#222' }}>USB</option>
                    <option value="Outro" style={{ background: '#222' }}>Outro</option>
                  </select>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_a3} onChange={e => handleChange('is_a3', e.target.checked)} style={{ width: '1rem', height: '1rem' }} /> 
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Impressora A3</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_color} onChange={e => handleChange('is_color', e.target.checked)} style={{ width: '1rem', height: '1rem' }} /> 
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Impressora colorida</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.show_in_widget} onChange={e => handleChange('show_in_widget', e.target.checked)} style={{ width: '1rem', height: '1rem' }} /> 
                    <span style={{ fontSize: '0.9rem', fontWeight: formData.show_in_widget ? '600' : '400', color: formData.show_in_widget ? 'var(--primary)' : 'var(--text-main)' }}>
                      Exibir no widget
                    </span>
                    <Info size={14} style={{ color: 'var(--primary)' }} />
                  </label>
                </div>
              </div>

              {/* Coluna 2 */}
              <div>
                <div className="form-group">
                  <label>Descrição</label>
                  <input type="text" className="input-glass" placeholder="RICOH P 311" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
                
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Fabricante</label>
                  <input type="text" className="input-glass" placeholder="Raw" value={formData.manufacturer} onChange={e => handleChange('manufacturer', e.target.value)} list="manufacturers" />
                  <datalist id="manufacturers">
                    <option value="Raw" /><option value="HP" /><option value="Brother" /><option value="Ricoh" /><option value="Epson" />
                  </datalist>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Custo A3 P&B</label>
                    <input type="number" step="0.01" className="input-glass" placeholder="0" value={formData.cost_a3_bw} onChange={e => handleChange('cost_a3_bw', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Custo A3 Cor</label>
                    <input type="number" step="0.01" className="input-glass" placeholder="0" value={formData.cost_a3_color} onChange={e => handleChange('cost_a3_color', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Coluna 3 */}
              <div>
                <div className="form-group">
                  <label>Endereço IP da impressora</label>
                  <input type="text" className="input-glass" placeholder="172.22.5.74" value={formData.ip_address} onChange={e => handleChange('ip_address', e.target.value)} />
                </div>
                
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Modelo</label>
                  <input type="text" className="input-glass" placeholder="Raw Queue" value={formData.model} onChange={e => handleChange('model', e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Custo A4 P&B</label>
                    <input type="number" step="0.01" className="input-glass" placeholder="0.1" value={formData.cost_a4_bw} onChange={e => handleChange('cost_a4_bw', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Custo A4 Cor</label>
                    <input type="number" step="0.01" className="input-glass" placeholder="0" value={formData.cost_a4_color} onChange={e => handleChange('cost_a4_color', e.target.value)} />
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé de Botões Estilizados */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowModal(false)} 
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)' }}
              >
                <X size={16} /> Cancelar
              </button>
              
              <button 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#10b981', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                disabled={saving}
                onClick={(e) => { e.preventDefault(); alert("Enviando página de teste para o CUPS..."); }}
              >
                <Zap size={16} /> Página de teste
              </button>

              <button 
                className="btn-primary" 
                onClick={handleSave} 
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f59e0b', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
              >
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Salvar
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--error)', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--error)', margin: '0 auto 1rem auto' }} />
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

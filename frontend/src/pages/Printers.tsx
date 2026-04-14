import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const mockPrinters = [
  { id: 1, name: 'HP LaserJet 400', location: 'RH - 2º Andar', price: 0.15 },
  { id: 2, name: 'Brother MFC', location: 'Financeiro', price: 0.10 },
  { id: 3, name: 'Lexmark MX410', location: 'Diretoria', price: 0.20 },
];

const Printers = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Filas de Impressão</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Gerenciamento e precificação de copias</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nova Impressora
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
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
            {mockPrinters.map(printer => (
              <tr key={printer.id}>
                <td style={{ fontWeight: 500 }}>{printer.name}</td>
                <td>{printer.location}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>R$ {printer.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-secondary" style={{ padding: '0.4rem', border: 'none', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-secondary" style={{ padding: '0.4rem', border: 'none', color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Cadastrar Impressora</h3>
            <div className="form-group">
              <label>Nome da Fila (Exato como no CUPS)</label>
              <input type="text" className="input-glass" placeholder="ex: HP_LaserJet_400" />
            </div>
            <div className="form-group">
              <label>Localização</label>
              <input type="text" className="input-glass" placeholder="ex: RH - 2º Andar" />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Custo por Cópia (R$)</label>
              <input type="number" step="0.01" className="input-glass" placeholder="0.10" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => setShowModal(false)}>Salvar Fila</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Printers;

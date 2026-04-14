import { Download, Filter } from 'lucide-react';

const mockJobs = [
  { id: 1, date: '13/04/2026 14:30', user: 'joao.silva', printer: 'HP LaserJet 400', pages: 12, copies: 1, total: 1.80 },
  { id: 2, date: '13/04/2026 15:10', user: 'maria.souza', printer: 'Brother MFC', pages: 5, copies: 2, total: 1.00 },
  { id: 3, date: '13/04/2026 16:05', user: 'carlos.pereira', printer: 'Lexmark MX410', pages: 45, copies: 1, total: 9.00 },
];

const Reports = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Relatórios de Uso</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Histórico detalhado e exportação</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ color: 'var(--text-main)' }}>
            <Download size={18} /> Exportar CSV
          </button>
          <button className="btn-primary">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} /> Filtros
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Início</label>
            <input type="date" className="input-glass" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Fim</label>
            <input type="date" className="input-glass" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fila de Impressão</label>
            <select className="input-glass" style={{ appearance: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
              <option value="">Todas as Filas</option>
              <option value="1">HP LaserJet 400</option>
              <option value="2">Brother MFC</option>
            </select>
          </div>
          <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Filtrar
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="glass-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Impressora</th>
              <th style={{ textAlign: 'center' }}>Páginas</th>
              <th style={{ textAlign: 'center' }}>Cópias</th>
              <th style={{ textAlign: 'right' }}>Custo Total</th>
            </tr>
          </thead>
          <tbody>
            {mockJobs.map(job => (
              <tr key={job.id}>
                <td>{job.date}</td>
                <td><span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.875rem' }}>{job.user}</span></td>
                <td>{job.printer}</td>
                <td style={{ textAlign: 'center' }}>{job.pages}</td>
                <td style={{ textAlign: 'center' }}>{job.copies}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>R$ {job.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

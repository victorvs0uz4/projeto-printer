import { useState, useEffect } from 'react';
import { Download, Filter, Loader2, FileText } from 'lucide-react';

interface PrintJob {
  id: number;
  date: string;
  user: string;
  printer: string;
  pages: number;
  copies: number;
  total: number;
}

interface PrinterOption {
  id: number;
  name: string;
}

const Reports = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [printers, setPrinters] = useState<PrinterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');

  const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrinters();
    fetchReports();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/printers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPrinters(data);
      }
    } catch (err) {
      console.error('Erro ao carregar impressoras:', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('start', startDate);
      if (endDate) params.set('end', endDate);
      if (selectedPrinter) params.set('printer_id', selectedPrinter);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_URL}/api/reports${queryString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao carregar relatórios');

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchReports();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const exportCSV = () => {
    if (jobs.length === 0) return;

    const headers = ['Data/Hora', 'Usuário', 'Impressora', 'Páginas', 'Cópias', 'Custo Total'];
    const rows = jobs.map(job => [
      formatDate(job.date),
      job.user,
      job.printer,
      job.pages,
      job.copies,
      `R$ ${job.total.toFixed(2)}`
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_impressao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Relatórios de Uso</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Histórico detalhado e exportação</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ color: 'var(--text-main)' }} onClick={exportCSV} disabled={jobs.length === 0}>
            <Download size={18} /> Exportar CSV
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
            <input type="date" className="input-glass" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Fim</label>
            <input type="date" className="input-glass" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fila de Impressão</label>
            <select
              className="input-glass"
              style={{ appearance: 'none', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
              value={selectedPrinter}
              onChange={e => setSelectedPrinter(e.target.value)}
            >
              <option value="">Todas as Filas</option>
              {printers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={handleFilter}>
            Filtrar
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          </div>
        ) : jobs.length > 0 ? (
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
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{formatDate(job.date)}</td>
                  <td><span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.875rem' }}>{job.user}</span></td>
                  <td>{job.printer}</td>
                  <td style={{ textAlign: 'center' }}>{job.pages}</td>
                  <td style={{ textAlign: 'center' }}>{job.copies}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>R$ {job.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Nenhum registro de impressão encontrado.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Os registros aparecerão conforme os trabalhos de impressão forem capturados pelo sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

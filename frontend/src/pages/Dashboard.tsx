import { useState, useEffect } from 'react';
import { FileText, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  total_pages: number;
  total_revenue: number;
}

interface ChartItem {
  name: string;
  pages: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ total_pages: 0, total_revenue: 0 });
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao carregar dashboard');

      const data = await response.json();
      setStats(data.stats);
      setChartData(data.chart || []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
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
      <h2 className="title" style={{ fontSize: '2rem' }}>Dashboard</h2>
      <p className="subtitle">Visão geral do sistema de impressão</p>

      <div className="grid-3">
        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="icon-wrapper">
              <FileText size={24} />
            </div>
            {stats.total_pages > 0 && (
              <span className="text-success" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={16} /> Ativo
              </span>
            )}
          </div>
          <div>
            <div className="value">{stats.total_pages.toLocaleString('pt-BR')}</div>
            <div className="label">Total Impresso (Mês)</div>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="icon-wrapper" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div>
            <div className="value">R$ {stats.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="label">Faturamento Estimado</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Impressoras Mais Utilizadas (Mês)</h3>
        {chartData.length > 0 ? (
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="pages" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Nenhum dado de impressão neste mês.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Os dados aparecerão conforme os trabalhos de impressão forem registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

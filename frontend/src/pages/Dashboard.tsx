import { FileText, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'HP LaserJet 400', pages: 4200 },
  { name: 'Brother MFC', pages: 3100 },
  { name: 'Lexmark MX410', pages: 1800 },
  { name: 'Epson EcoTank', pages: 980 },
];

const Dashboard = () => {
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
            <span className="text-success" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} /> +12%
            </span>
          </div>
          <div>
            <div className="value">10,080</div>
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
            <div className="value">R$ 1.512,00</div>
            <div className="label">Faturamento Estimado</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Impressoras Mais Utilizadas (Mês)</h3>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      </div>
    </div>
  );
};

export default Dashboard;

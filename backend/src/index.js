require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const db = require('./database/db');
const { startWatcher } = require('./cups-watcher');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'print-manager-super-secret-key-2026';

app.use(cors());
app.use(express.json());

// Iniciar Monitor do CUPS
startWatcher();

// ==== ROTAS DA API ====

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT id, password_hash, requires_password_change FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });
        
        try {
            let valid = false;
            if (user.password_hash.startsWith('$argon2')) {
                valid = await argon2.verify(user.password_hash, password);
            } else {
                valid = (password === user.password_hash);
            }

            if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
            
            const tokenPayload = { id: user.id, username, requires_password_change: !!user.requires_password_change };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
            
            res.json({ token, username, requiresPasswordChange: !!user.requires_password_change });
        } catch (error) {
            return res.status(500).json({ error: 'Erro de formatação na checagem da senha.' });
        }
    });
});

// Middleware Autenticação
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token não fornecido' });
    
    const token = header.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido/expirado' });
        
        if (decoded.requires_password_change && req.path !== '/api/auth/change-password') {
            return res.status(403).json({ error: 'Necessário alterar a senha primeiro', requiresPasswordChange: true });
        }

        req.user = decoded;
        next();
    });
};

// Troca de Senha Obrigatória
app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    try {
        const hashed = await argon2.hash(newPassword);
        db.run(`UPDATE users SET password_hash = ?, requires_password_change = 0 WHERE id = ?`, 
            [hashed, req.user.id], function(err) {
            
            if (err) return res.status(500).json({ error: 'Erro ao atualizar a senha' });
            
            const token = jwt.sign({ id: req.user.id, username: req.user.username }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ message: 'Senha atualizada com sucesso', token, username: req.user.username });
        });
    } catch (e) {
        return res.status(500).json({ error: 'Erro ao criptografar senha' });
    }
});

// Impressoras (Printers) - CRUD Completo

// Listar todas
app.get('/api/printers', authMiddleware, (req, res) => {
    db.all(`SELECT * FROM printers ORDER BY name ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar nova
app.post('/api/printers', authMiddleware, (req, res) => {
    const { name, location, price_per_copy } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'O nome da impressora é obrigatório.' });
    }
    db.run(`INSERT INTO printers (name, location, price_per_copy) VALUES (?, ?, ?)`, 
        [name.trim(), location || '', price_per_copy || 0], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Já existe uma impressora com este nome.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, name: name.trim(), location, price_per_copy });
    });
});

// Atualizar impressora
app.put('/api/printers/:id', authMiddleware, (req, res) => {
    const { name, location, price_per_copy } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'O nome da impressora é obrigatório.' });
    }

    db.run(`UPDATE printers SET name = ?, location = ?, price_per_copy = ? WHERE id = ?`,
        [name.trim(), location || '', price_per_copy || 0, id], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Já existe uma impressora com este nome.' });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Impressora não encontrada.' });
            }
            res.json({ id: Number(id), name: name.trim(), location, price_per_copy });
    });
});

// Excluir impressora
app.delete('/api/printers/:id', authMiddleware, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM printers WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Impressora não encontrada.' });
        }
        res.json({ message: 'Impressora excluída com sucesso.' });
    });
});

// Dashboard & Resumo
app.get('/api/dashboard', authMiddleware, (req, res) => {
    // Retorna total de paginas e custo este mes, e impressoras mais usadas
    const statsQuery = `
        SELECT 
            SUM(pages * copies) as total_pages, 
            SUM(total_cost) as total_revenue
        FROM print_jobs 
        WHERE strftime('%Y-%m', printed_at) = strftime('%Y-%m', 'now')
    `;
    
    const chartQuery = `
        SELECT p.name, SUM(pj.pages * pj.copies) as pages
        FROM print_jobs pj
        JOIN printers p ON pj.printer_id = p.id
        WHERE strftime('%Y-%m', pj.printed_at) = strftime('%Y-%m', 'now')
        GROUP BY pj.printer_id
        ORDER BY pages DESC
        LIMIT 5
    `;

    db.get(statsQuery, [], (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(chartQuery, [], (err, chart) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                stats: {
                    total_pages: stats.total_pages || 0,
                    total_revenue: stats.total_revenue || 0
                },
                chart
            });
        });
    });
});

// Relatórios (com filtros de data e impressora)
app.get('/api/reports', authMiddleware, (req, res) => {
    const { start, end, printer_id } = req.query;

    let query = `
        SELECT pj.id, pj.printed_at as date, pj.username as user, p.name as printer, 
               pj.pages, pj.copies, pj.total_cost as total 
        FROM print_jobs pj
        JOIN printers p ON pj.printer_id = p.id
    `;

    const conditions = [];
    const params = [];

    if (start) {
        conditions.push(`pj.printed_at >= ?`);
        params.push(start);
    }
    if (end) {
        conditions.push(`pj.printed_at <= ? || ' 23:59:59'`);
        params.push(end);
    }
    if (printer_id) {
        conditions.push(`pj.printer_id = ?`);
        params.push(printer_id);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY pj.printed_at DESC LIMIT 500`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ==== SERVIR FRONTEND EM PRODUÇÃO ====
// Repassar requests para o Vite Build (onde o React Viverá)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Apenas GET serve o SPA - PUT/DELETE/POST para rotas inexistentes retornam 404
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Ligar Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend] API rodando na porta ${PORT}`);
    console.log(`[Backend] Servindo arquivos front-end em ${frontendPath}`);
});

const { Tail } = require('tail');
const fs = require('fs');
const path = require('path');
const db = require('./database/db');

// CUPS page_log default path on Linux
const LOG_FILE = process.env.CUPS_LOG_PATH || '/var/log/cups/page_log';

const startWatcher = () => {
    console.log(`[CUPS Watcher] Tentando iniciar monitoramento no arquivo: ${LOG_FILE}`);

    if (!fs.existsSync(LOG_FILE)) {
        console.warn(`[CUPS Watcher] Arquivo de log não encontrado em ${LOG_FILE}. Monitoramento inativo para desenvolvimento local.`);
        return;
    }

    try {
        const tail = new Tail(LOG_FILE, { fromBeginning: false });

        tail.on('line', (data) => {
            console.log('[CUPS Watcher] Nova linha detectada:', data);
            processLogLine(data);
        });

        tail.on('error', (error) => {
            console.error('[CUPS Watcher] Erro:', error);
        });

        console.log(`[CUPS Watcher] Monitoramento iniciado com sucesso em ${LOG_FILE}`);
    } catch (err) {
        console.error('[CUPS Watcher] Falha ao iniciar tail:', err.message);
    }
};

// Exemplo da estrutura da linha (Pode variar com o CUPS config, usando base padrão)
// Printer User JobID [DD/MMM/YYYY:HH:MM:SS +TZ] PageNum Copies Billing HostName JobName Media Sides
const processLogLine = (line) => {
    // Regex simples para fatiar por espaço considerando a string "Printer User ..." - precisa ser adaptado se houver aspas complexas
    // Basic split by spaces just to illustrate the logic:
    const parts = line.split(' ');
    
    if (parts.length < 6) return;

    const printerName = parts[0];
    const user = parts[1];
    const jobId = parseInt(parts[2], 10);
    // As o log tem a data entre colchetes [DD/MMM/YYYY:HH:MM:SS +TZ], a posição depende dos espaços.
    // Para simplificar no middleware, pegaremos apenas as flags numéricas para calcular:
    
    // Supondo o CUPS default: Printer User JobID [Date Time] PageNum Copies Options ...
    // Considerando partes aproximadas apos tratar espaços na data:
    // Uma forma mais segura de extrair "numero de copias e paginas": Em logs nativos do CUPS page_log, 
    // a quantidade de cópias costuma ser o item apos o page number.
    // Como regex exato depende do PageLogFormat do servidor, vamos extrair propriedades chave se possivel.
    
    // Implementacao fallback - Procurando digitos apos a data.
    const match = line.match(/^(\S+) (\S+) (\d+) \[(.+?)\] (\d+) (\d+)/);
    if (!match) return;

    const [, parsedPrinter, parsedUser, parsedJobId, parsedDate, parsedPageNum, parsedCopies] = match;
    
    const pages = parseInt(parsedPageNum, 10) || 1;
    const copies = parseInt(parsedCopies, 10) || 1;

    // Buscar a impressora no banco de dados para calcular o custo e inserir
    db.get(`SELECT id, price_per_copy FROM printers WHERE name = ?`, [parsedPrinter], (err, row) => {
        if (err || !row) {
            console.warn(`[CUPS Watcher] Impressora não cadastrada no sistema ou falha ao buscar: ${parsedPrinter}`);
            // Podemos cadastrar a impressora default com preco 0, ou ignorar:
            return;
        }

        const totalCost = pages * copies * row.price_per_copy;

        // Inserir o Job
        db.run(`INSERT INTO print_jobs (job_id, printer_id, username, pages, copies, total_cost, printed_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [parsedJobId, row.id, parsedUser, pages, copies, totalCost], function(err) {
                if (err) {
                    console.error('[CUPS Watcher] Erro ao inserir no banco:', err.message);
                } else {
                    console.log(`[CUPS Watcher] Log persistido. JobID: ${parsedJobId}, Custo: R$ ${totalCost.toFixed(2)}`);
                }
            }
        );
    });
};

module.exports = { startWatcher };

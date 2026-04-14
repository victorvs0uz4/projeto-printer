#!/bin/bash

# =========================================================================
# INSTALL SCRIPT - PRINTMANAGER (Estilo Appliance PrinterTux)
# Desenvolvido para Ubuntu / Debian
# =========================================================================

echo "======================================================="
echo "   Iniciando Instalação Mágica do PrintManager"
echo "======================================================="

# 1. Checar se é root
if [ "$EUID" -ne 0 ]
  then echo "Por favor, execute como root (sudo ./install.sh)"
  exit
fi

# 2. Atualizar pacotes
echo "[+] Atualizando pacotes..."
apt update -y
apt upgrade -y

# 3. Instalar o CUPS e dependências essenciais
echo "[+] Instalando o CUPS..."
apt install -y cups curl sudo git

# Configurar o CUPS para aceitar conexões remotas
echo "[+] Configurando o CUPS..."
cupsctl --remote-admin --remote-any --share-printers
systemctl restart cups

# 4. Instalar Node.js (se não houver)
if ! command -v node &> /dev/null
then
    echo "[+] Node.js não encontrado. Instalando versão 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "[+] Node.js já está instalado!"
fi

# 5. Configurar Aplicação - Baixar código do GitHub
APP_DIR="/opt/printmanager"
REPO_URL="https://github.com/victorvs0uz4/projeto-printer.git"

if [ -d "$APP_DIR" ]; then
    echo "[+] Atualizando código existente..."
    cd $APP_DIR
    git pull origin main
else
    echo "[+] Baixando código do repositório..."
    git clone $REPO_URL $APP_DIR
fi

# 6. Instalar pacotes NPM (Backend e Frontend) e Buildar o Frontend
echo "[+] Inicializando Backend e construindo o Frontend..."
cd $APP_DIR/backend
npm install

cd $APP_DIR/frontend
npm install
npm run build

# 7. Criar o serviço do systemd para o backend
echo "[+] Criando serviço e colocando em autostart..."
cat <<EOF > /etc/systemd/system/printmanager.service
[Unit]
Description=PrintManager Backend Service
After=network.target cups.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 8. Recarregar systemd e iniciar o serviço
systemctl daemon-reload
systemctl enable printmanager.service
systemctl start printmanager.service
systemctl restart cups

echo "======================================================="
echo "   Instalação Concluída com Sucesso! 🚀"
echo ""
echo "   Seu Servidor PrintManager está online."
echo "   Acesse: http://<IP_DO_SERVIDOR>:3000"
echo "   Login Padrão: admin"
echo "   Senha Padrão: 123alterar"
echo ""
echo "======================================================="

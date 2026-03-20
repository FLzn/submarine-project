# Deploy na VPS

## Pré-requisitos

```bash
# 1. Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20

# 2. PostgreSQL
apt install postgresql -y
sudo -u postgres psql -c "CREATE USER submarine WITH PASSWORD 'suasenha';"
sudo -u postgres psql -c "CREATE DATABASE submarine_db OWNER submarine;"

# 3. Dependências do Chromium (necessário para geração de PDF)
apt-get install -y libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2

# 4. PM2
npm install -g pm2
```

## Deploy

```bash
# 1. Clonar o repositório
git clone <url-do-repo> /var/www/submarine-api
cd /var/www/submarine-api

# 2. Criar o .env com os valores de produção (copiar .env.example como base)
cp .env.example .env
nano .env   # preencher todos os valores

# 3. Instalar dependências e buildar
npm ci
npm run build

# 4. Rodar migrations
psql -U submarine -d submarine_db -f database/migrations/001_initial.sql
psql -U submarine -d submarine_db -f database/migrations/002_preferencias.sql

# 5. Iniciar com PM2
pm2 start npm --name submarine-api -- run start:prod
pm2 save
pm2 startup   # rodar o comando que ele sugerir para auto-start no boot
```

## Variáveis de ambiente obrigatórias (.env)

```env
JWT_SECRET=<segredo longo e aleatório>

DB_HOST=localhost
DB_PORT=5432
DB_USER=submarine
DB_PASS=<senha do banco>
DB_NAME=submarine_db

SMS_USER=<usuário pontaltech>
SMS_PASSWORD=<senha pontaltech>

APP_URL=https://seudominio.com

MAIL_HOST=<host smtp>
MAIL_PORT=465
MAIL_USER=<email remetente>
MAIL_PASSWORD=<senha smtp>
MAIL_TO=<destinatário do relatório mensal>
```

## Comandos úteis pós-deploy

```bash
pm2 logs submarine-api       # ver logs em tempo real
pm2 restart submarine-api    # reiniciar após atualização
pm2 status                   # status do processo

# Atualizar código
cd /var/www/submarine-api
git pull
npm ci
npm run build
pm2 restart submarine-api
```

## Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> Quando o frontend estiver pronto, atualizar o CORS em `src/main.ts` trocando `origin: '*'` pelo domínio real.

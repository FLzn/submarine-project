# Deploy na VPS

> Assumindo Ubuntu/Debian. Todos os comandos rodam como root ou com `sudo`.

---

## 1. Instalar o Node.js

```bash
# Instala o nvm (gerenciador de versões do Node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recarrega o terminal para o nvm funcionar
source ~/.bashrc

# Instala o Node 20 (LTS recomendado)
nvm install 20
nvm use 20

# Confirma que instalou certo (deve mostrar v20.x.x)
node -v
npm -v
```

---

## 2. Instalar o PostgreSQL

```bash
# Instala o PostgreSQL
apt install postgresql -y

# Inicia o serviço
systemctl start postgresql
systemctl enable postgresql   # faz iniciar automaticamente com o servidor

# Cria o usuário e banco de dados do projeto
# (troque 'suasenha' pela senha real que vai colocar no .env)
sudo -u postgres psql -c "CREATE USER submarine WITH PASSWORD 'suasenha';"
sudo -u postgres psql -c "CREATE DATABASE submarine_db OWNER submarine;"

# Confirma que o banco foi criado
sudo -u postgres psql -c "\l"
```

---

## 3. Instalar dependências do Chromium (necessário para gerar PDF)

O projeto usa Puppeteer para gerar PDFs. Em servidores Linux, o Chromium precisa de bibliotecas extras do sistema:

```bash
apt-get install -y \
  libglib2.0-0 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

---

## 4. Instalar o PM2 (mantém o servidor rodando 24/7)

```bash
npm install -g pm2

# Confirma instalação
pm2 -v
```

---

## 5. Baixar o código do projeto

```bash
# Clona o repositório (substitua pela URL real do GitHub)
git clone https://github.com/seu-usuario/submarine-project.git /var/www/submarine-api

# Entra na pasta
cd /var/www/submarine-api
```

---

## 6. Criar o arquivo .env

```bash
# Cria o .env a partir do exemplo
cp .env.example .env

# Abre para editar (preencher com os valores reais)
nano .env
```

Preencha todas as variáveis:

```env
JWT_SECRET=<string longa e aleatória, ex: openssl rand -hex 32>

DB_HOST=localhost
DB_PORT=5432
DB_USER=submarine
DB_PASS=<mesma senha usada no passo 2>
DB_NAME=submarine_db

SMS_USER=<usuário pontaltech>
SMS_PASSWORD=<senha pontaltech>

APP_URL=https://seudominio.com

MAIL_HOST=<host smtp>
MAIL_PORT=465
MAIL_USER=<email remetente>
MAIL_PASSWORD=<senha smtp>
MAIL_TO=<email que receberá o relatório mensal>
```

Salvar no nano: `Ctrl+O` → Enter → `Ctrl+X`

---

## 7. Instalar dependências e buildar

```bash
# Instala os pacotes do projeto (mais seguro que npm install em produção)
npm ci

# Compila o TypeScript para JavaScript
npm run build

# Confirma que o build gerou os arquivos (deve listar arquivos .js)
ls dist/src/
```

---

## 8. Rodar as migrations (criar tabelas no banco)

```bash
psql -U submarine -d submarine_db -f database/migrations/001_initial.sql
psql -U submarine -d submarine_db -f database/migrations/002_preferencias.sql
```

Se pedir senha, é a mesma do `.env` (`DB_PASS`).

---

## 9. Iniciar o servidor com PM2

```bash
# Inicia o servidor
pm2 start npm --name submarine-api -- run start:prod

# Verifica se está rodando (Status deve ser "online")
pm2 status

# Salva a lista de processos para sobreviver a reinicializações
pm2 save

# Configura o PM2 para iniciar junto com o servidor
pm2 startup
# ⚠️ O comando acima vai imprimir outro comando para você copiar e rodar — rode ele!
```

---

## 10. Confirmar que está funcionando

```bash
# Deve retornar algo (não erro de conexão recusada)
curl http://localhost:3000
```

---

## Comandos úteis no dia a dia

```bash
pm2 logs submarine-api        # ver logs em tempo real
pm2 status                    # ver status do processo
pm2 restart submarine-api     # reiniciar o servidor

# Atualizar o código após um git push
cd /var/www/submarine-api
git pull
npm ci
npm run build
pm2 restart submarine-api
```

---

## Nginx (reverse proxy — quando o frontend estiver pronto)

```bash
apt install nginx -y
```

Criar arquivo `/etc/nginx/sites-available/submarine`:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # API (backend)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend (arquivos estáticos)
    root /var/www/submarine-frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/submarine /etc/nginx/sites-enabled/
nginx -t        # testa a config (deve dizer "ok")
systemctl restart nginx
```

SSL gratuito com Let's Encrypt:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d seudominio.com
```

> Quando o frontend estiver no ar, atualizar o CORS em `src/main.ts` trocando `origin: '*'` pelo domínio real e reiniciar com `pm2 restart submarine-api`.

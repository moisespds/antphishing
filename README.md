# 🛡️ Extensão Anti-Phishing para TCC

Extensão de navegador que analisa URLs em tempo real usando APIs de verificação de phishing (Google Safe Browsing, URLhaus).

## 📋 Características

- ✅ Detecta phishing e malware em URLs visitadas
- ✅ Consulta **Google Safe Browsing API** (padrão da indústria)
- ✅ Fallback para **URLhaus** (gratuito, sem chave)
- ✅ Cache local com TTL de 24h para otimizar requisições
- ✅ Whitelist local para domínios confiáveis
- ✅ Notificações do navegador quando ameaças detectadas
- ✅ Funciona offline com heurísticas locais

## 🚀 Como Usar

### Pré-requisitos
- Node.js 14+ instalado
- Navegador baseado em Chromium (Chrome, Edge, Brave)

### 1. Instalar Dependências
```bash
cd servidor
npm install
```

### 2. Configurar Google Safe Browsing API (Opcional)

Se você quer usar Google Safe Browsing (recomendado):

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto (ou use existente)
3. Habilite a API "Safe Browsing API"
4. Vá para **Credenciais** → **Criar Credencial** → **API Key**
5. Copie a chave gerada

#### Windows (CMD):
```cmd
set GOOGLE_API_KEY=AIzaSyDx...sua_chave_aqui...
node server.js
```

#### Windows (PowerShell):
```powershell
$env:GOOGLE_API_KEY="AIzaSyDx...sua_chave_aqui..."
node server.js
```

#### Linux/Mac:
```bash
export GOOGLE_API_KEY="AIzaSyDx...sua_chave_aqui..."
node server.js
```

**Se deixar em branco**, a extensão usará **URLhaus** (gratuito, sem limite tão severo).

### 3. Iniciar Servidor
```bash
node server.js
```

Você verá:
```
✅ Servidor Anti-Phishing rodando em http://localhost:3000
✅ Google Safe Browsing API configurada
```

Ou se não tiver chave:
```
✅ Servidor Anti-Phishing rodando em http://localhost:3000
⚠️  Google Safe Browsing API não configurada — usando URLhaus como fallback
```

### 4. Carregar Extensão no Chrome/Edge

1. Abra `chrome://extensions/` (ou `edge://extensions/`)
2. Ative **"Modo de desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar extensão sem compactação"**
4. Selecione a pasta raiz do projeto (onde está `manifest.json`)

### 5. Testar

- Navegue para um site confiável (ex: `https://www.amazon.com/`)
  - ✅ Nenhum alerta
- Navegue para um site suspeito (ex: domínios de phishing conhecidos)
  - ⚠️ Você verá uma notificação do navegador com aviso

## 📊 Endpoints da API Local

### POST `/api/validateDomain`
Verifica se uma URL é segura ou suspeita.

**Request:**
```json
{
  "url": "https://www.exemplo.com"
}
```

**Response (Seguro):**
```json
{
  "status": "seguro",
  "message": "Domínio verificado como seguro pelas APIs externas.",
  "source": "Google Safe Browsing"
}
```

**Response (Suspeito):**
```json
{
  "status": "suspeito",
  "message": "⚠️ Possível ameaça detectada: SOCIAL_ENGINEERING",
  "source": "Google Safe Browsing",
  "threat": "SOCIAL_ENGINEERING"
}
```

### GET `/api/status`
Retorna status do servidor e configurações.

**Response:**
```json
{
  "status": "online",
  "googleSafeBrowsingConfigured": true,
  "cacheSize": 42,
  "message": "Google Safe Browsing ativo"
}
```

## 🔐 Segurança

- Nenhuma chave de API é armazenada na extensão
- Comunicação entre extension ↔ servidor local (não expõe URLs ao navegador)
- URLs são enviadas apenas aos serviços de verificação confiáveis (Google, URLhaus)
- Cache local não persiste dados sensíveis

## 🐛 Troubleshooting

### "Failed to fetch" no console da extensão
- Verifique se o servidor está rodando: `node server.js`
- Verifique se a porta 3000 está disponível: `netstat -ano | findstr :3000`

### Alguns sites não são analisados
- Alguns sites podem estar fora dos bancos de dados das APIs (novo, pequeno domínio)
- URLhaus é mais leve; Google Safe Browsing tem mais cobertura

### Muitos falsos positivos
- Pode ser que a URL esteja em lista de spam/malware legítima
- Verifique em: https://www.virustotal.com/gui/home/upload
- Adicione domínios confiáveis à whitelist em `servidor/server.js`

## 📚 APIs Utilizadas

| API | Cobertura | Preço | Sem Autenticação |
|-----|-----------|-------|------------------|
| Google Safe Browsing | Malware, Phishing, Unwanted Software | Gratuito (600 req/min) | ❌ Requer API Key |
| URLhaus | URLs Maliciosas Ativas | Gratuito | ✅ Sim |

## 🎓 Para TCC

Este projeto demonstra:
- Arquitetura de extensões Chrome (Manifest v3)
- Comunicação background script ↔ APIs externas
- Cache e otimização de requisições
- Tratamento de erros e fallbacks
- Segurança em extensões (sem exposição de dados)

## 📝 Estrutura do Projeto

```
extensao-antiphishing/
├── manifest.json           # Declaração da extensão
├── background.js          # Service worker principal
├── content.js             # Script injetado nas páginas
├── servidor/
│   ├── server.js          # API local Express
│   ├── package.json       # Dependências
│   └── .env.example       # Exemplo de variáveis
└── README.md
```

## 🚦 Status de Desenvolvimento

- [x] Verificação de URLs
- [x] Google Safe Browsing API
- [x] Fallback URLhaus
- [x] Cache local
- [x] Notificações
- [ ] Modal/banner estilizado in-page
- [ ] Histórico de verificações
- [ ] Detecção de typosquatting (Levenshtein)

## 📧 Contato / Dúvidas

Para dúvidas sobre o TCC, consulte a documentação:
- Google Safe Browsing: https://developers.google.com/safe-browsing
- URLhaus: https://urlhaus.abuse.ch/api/
- Chrome Extensions: https://developer.chrome.com/docs/extensions/

---

**Autor:** [Seu Nome]  
**Instituição:** [Sua Faculdade]  
**Data:** Novembro 2025

# 🛡️ Extensão Agora Funciona Offline!

## O que Mudou

A extensão agora funciona **100% offline** sem depender de um servidor Node.js rodando:

### 1. Whitelist Local (Domínios Confiáveis)
Domínios conhecidos como seguros são verificados localmente em `content.js`

### 2. Blacklist Local (Domínios Suspeitos)
Adicione domínios maliciosos do PROCON-SP diretamente na extensão

### 3. Detecção de Typosquatting
Compara o hostname contra domínios populares (Amazon, Google, PayPal, etc.)
- Se a similaridade for > 80%, marca como suspeito
- Exemplo: `amaazzon.com` (95% similar a `amazon.com`) = SUSPEITO

### 4. Fallback para Servidor
Se o servidor local estiver disponível, usa a API Google Safe Browsing
Se não estiver, usa heurística local

---

## Como Adicionar Domínios do PROCON-SP

### Passo 1: Obtenha a lista do PROCON-SP
Consulte: https://www.procon.sp.gov.br/

### Passo 2: Edite `content.js`
Procure pela linha:
```javascript
const SUSPICIOUS_DOMAINS = [
  // Phishing conhecidos - adicione URLs do PROCON-SP aqui
];
```

### Passo 3: Adicione os domínios
```javascript
const SUSPICIOUS_DOMAINS = [
  "amaazzon.com",           // Phishing da Amazon
  "amazon-br.com",          // Phishing falso
  "amazn.com",              // Typosquatting
  "paypa1.com",             // Phishing do PayPal (letra l minúscula virada em 1)
  "mercadolibre-br.com",    // Phishing do Mercado Livre
  // ... adicione mais aqui
];
```

### Passo 4: Recarregue a extensão
- Abra `chrome://extensions/`
- Clique em **Reload**

---

## Teste a Extensão

### Teste 1: Domínio Confiável
Visite: `https://www.amazon.com`
- ✅ Sem alerta (está na whitelist)

### Teste 2: Typosquatting
Visite: `http://amaazzon.com` (ou similar)
- 🔴 Alerta: "Possível typosquatting de amazon.com"

### Teste 3: Domínio Desconhecido
Visite: `https://exemplo-novo-aleatorio.com`
- ✅ Sem alerta (não está em listas conhecidas)

### Teste 4: Com Servidor Rodando
Se você rodar `node server.js`:
```cmd
cd "c:\Users\Moises Prado\extensao-antiphishing\servidor"
node server.js
```
A extensão consultará o Google Safe Browsing API automaticamente.

---

## Como Funciona Agora (Fluxo)

```
Usuário acessa URL
    ↓
Content.js verifica:
  1. Está na whitelist? → ✅ Seguro
  2. Está na blacklist? → 🔴 Suspeito
  3. É typosquatting? → 🔴 Suspeito
  4. Servidor disponível? → Consulta API Google
  5. Nada acima? → ✅ Assume seguro
    ↓
Se suspeito: 🔴 Alerta/Notificação
```

---

## Para seu TCC - Próximas Melhorias

1. **Expandir Blacklist**
   - Integrar com banco de dados de phishing (PhishTank, URLhaus)
   - Sincronizar lista diariamente

2. **Machine Learning** (opcional)
   - Treinar modelo para detectar características de phishing
   - Analisar HTML/CSS da página

3. **Análise de Certificado SSL**
   - Verificar validade do certificado
   - Alertar sobre certificados auto-assinados

4. **Heurística Avançada**
   - Detectar domínios com muitos caracteres especiais
   - Verificar age/reputação do domínio
   - Análise de URL path suspeito

---

## Logs para Depuração

Abra o DevTools (F12) e procure por logs `[Content]`:
```
[Content] Recebido pedido para validar: https://www.amazon.com
[Content] Domínio confiável encontrado na whitelist
```

Ou procure pelos logs do background:
```
✅ Site verificado com sucesso: Domínio na whitelist local, source: local_whitelist
```

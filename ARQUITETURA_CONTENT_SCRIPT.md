# 🔧 Solução: Content Script como Intermediário

## Problema Original
O Service Worker (background.js) não consegue fazer `fetch()` para `http://localhost:3000` mesmo com permissões no manifest. Isso é uma limitação de segurança do Chrome.

## Solução Implementada
Usamos o **content script** como intermediário de comunicação:

```
Página Web
    ↓
content.js (consegue fazer fetch para localhost)
    ↓
http://localhost:3000/api/validateDomain
    ↓
Resultado → background.js
    ↓
Alerta/Notificação
```

## Como Funciona

### 1. Background detecta mudança de URL
```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Tab carregou uma URL
  checkUrlBackground(tabId, tab.url);
});
```

### 2. Background envia mensagem para Content Script
```javascript
const response = await chrome.tabs.sendMessage(tabId, {
  action: "validateUrl",
  url: url
});
```

### 3. Content Script faz o fetch (consegue!)
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "validateUrl") {
    fetch("http://localhost:3000/api/validateDomain", {
      method: "POST",
      body: JSON.stringify({ url: request.url })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Mantém listener aberto para resposta async
  }
});
```

### 4. Background recebe resposta e toma ação
```javascript
const result = response.data;
if (result.status === "suspeito") {
  // Dispara alerta
}
```

## Vantagens desta Arquitetura
✅ Content scripts conseguem fazer fetch para localhost
✅ Service workers continuam rodando mesmo com múltiplas abas
✅ Seguro (sem exposição de dados)
✅ Padrão usado por muitas extensões populares

## Testes
Se funcionar:
- Você verá no console do Service Worker:
  ```
  🔄 Enviando mensagem para content.js validar URL
  📨 Resposta recebida do content script: {success: true, data: {...}}
  ✅ JSON parseado: {status: "seguro", ...}
  ```

- Você verá no console da página (content.js):
  ```
  [Content] Recebido pedido para validar: https://www.amazon.com
  [Content] Resposta do servidor: 200
  [Content] Dados parseados: {status: "seguro", ...}
  ```

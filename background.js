console.log('Background service worker iniciado - anti-phishing');

let serverOfflineNotified = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    // Fazer a verificação no contexto do background (não no contexto da página)
    checkUrlBackground(tabId, tab.url);
  }
});

async function checkUrlBackground(tabId, url) {
  console.log("Verificando URL (background):", url);

  try {
    console.log("🔄 Enviando mensagem para content.js validar URL");
    
    // Envia mensagem para o content script fazer o fetch
    // Content scripts conseguem acessar localhost, mas service workers não
    const response = await chrome.tabs.sendMessage(tabId, {
      action: "validateUrl",
      url: url
    });

    console.log("📨 Resposta recebida do content script:", response);
    
    if (!response.success) {
      throw new Error(`Content script error: ${response.error}`);
    }

    const result = response.data;
    console.log("✅ JSON parseado:", result);
    // servidor respondeu, resetamos o indicador de offline
    serverOfflineNotified = false;

    if (result.status === "suspeito") {
      // Tentar injetar um alerta na página (executado no contexto da aba).
      // Se a aba estiver mostrando uma página de erro (chrome-error://...) a injeção falhará;
      // nesse caso fazemos um fallback para uma notificação.
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (msg) => { alert(msg); },
        args: ["⚠️ Atenção! Este site pode ser uma tentativa de golpe."]
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.warn("Erro ao injetar alerta:", chrome.runtime.lastError);
          // Fallback: usar notificações do SO a partir do background
          try {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "alert_icon.png",
              title: "Proteção Anti-Phishing",
              message: `⚠️ Possível site de phishing detectado: ${url}`
            }, (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error('Não foi possível criar notificação:', chrome.runtime.lastError);
              } else {
                console.log('Notificação criada:', notificationId);
              }
            });
          } catch (notifyErr) {
            console.error('Erro ao criar notificação de fallback:', notifyErr);
          }
        } else {
          console.log("Alerta injetado com sucesso", injectionResults);
        }
      });
    } else {
      console.log("✅ Site verificado com sucesso:", result.message);
    }
  } catch (error) {
    console.error("❌ Erro na verificação:", error);
    console.error("   Tipo de erro:", error.name);
    console.error("   Mensagem:", error.message);
    console.error("   Stack:", error.stack);
    
    // Se o servidor de verificação estiver inacessível, não dispare alertas de phishing
    // para evitar falsos positivos — apenas notifique o usuário uma vez.
    if (!serverOfflineNotified) {
      serverOfflineNotified = true;
      try {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "alert_icon.png",
          title: "Proteção Anti-Phishing — serviço indisponível",
          message: "O serviço de verificação local não está disponível (http://localhost:3000). Verifique se o servidor está rodando."
        }, (id) => {
          if (chrome.runtime.lastError) console.error('notify error', chrome.runtime.lastError);
        });
      } catch (notifyErr) {
        console.error('Erro ao criar notificação de serviço offline:', notifyErr);
      }
    }
  }
}
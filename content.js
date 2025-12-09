console.log("Extensão Anti-Phishing ativa e monitorando...");

// Lista de domínios confiáveis (embutida na extensão)
const TRUSTED_DOMAINS = [
  "amazon.com",
  "www.amazon.com",
  "paypal.com",
  "www.paypal.com",
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
  "google.com",
  "www.google.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com"
];

// Lista de domínios suspeitos/maliciosos conhecidos (pode ser expandida)
const SUSPICIOUS_DOMAINS = [
  // Phishing conhecidos - adicione URLs do PROCON-SP aqui
    "amaazzon.com",
    "123importados.com",
    "paypa1.com",
    "mercadolibre-br.com"
];

function isDomainTrusted(hostname) {
  return TRUSTED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith("." + domain)
  );
}

function isDomainSuspicious(hostname) {
  return SUSPICIOUS_DOMAINS.some(domain =>
    hostname === domain || hostname.includes(domain)
  );
}

// Verificação simples de typosquatting usando similaridade
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 100.0;
  const editDistance = getEditDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100.0;
}

function getEditDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
}

// Content script como intermediário para requisições ao servidor local (fallback)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "validateUrl") {
    const { url } = request;
    console.log("[Content] Recebido pedido para validar:", url);

    let hostname = "";
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch (e) {
      console.error("[Content] URL inválida:", url);
      sendResponse({ success: true, data: { status: "suspeito", message: "URL inválida" } });
      return true;
    }

    // 1. Verificar se é domínio confiável
    if (isDomainTrusted(hostname)) {
      console.log("[Content] Domínio confiável encontrado na whitelist");
      sendResponse({ 
        success: true, 
        data: { status: "seguro", message: "Domínio na whitelist local", source: "local_whitelist" } 
      });
      return true;
    }

    // 2. Verificar se é domínio suspeito conhecido
    if (isDomainSuspicious(hostname)) {
      console.log("[Content] Domínio suspeito encontrado na blacklist");
      sendResponse({ 
        success: true, 
        data: { status: "suspeito", message: "Domínio na blacklist de phishing", source: "local_blacklist" } 
      });
      return true;
    }

    // 3. Tentar fazer fetch para servidor local como fallback
    fetch("http://localhost:3000/api/validateDomain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
      .then(res => {
        console.log("[Content] Resposta do servidor:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("[Content] Dados parseados:", data);
        sendResponse({ success: true, data });
      })
      .catch(err => {
        console.warn("[Content] Servidor local indisponível, usando fallback local:", err.message);
        // Se o servidor não estiver disponível, usar heurística local de typosquatting
        let isSuspicious = false;
        let reason = "";

        // Detectar typosquatting comparando com domínios populares
        const popularDomains = [
          "amazon.com", "paypal.com", "google.com", "facebook.com", 
          "apple.com", "microsoft.com", "netflix.com", "instagram.com",
          "mercadolivre.com.br", "whatsapp.com"
        ];

        for (const popular of popularDomains) {
          const similarity = calculateSimilarity(hostname, popular);
          console.log(`[Content] Similaridade com ${popular}: ${similarity.toFixed(2)}%`);
          if (similarity > 80 && similarity < 100) {
            isSuspicious = true;
            reason = `Possível typosquatting de ${popular}`;
            break;
          }
        }

        const response = {
          status: isSuspicious ? "suspeito" : "seguro",
          message: isSuspicious ? reason : "Domínio não está na lista de ameaças",
          source: "local_heuristic"
        };
        sendResponse({ success: true, data: response });
      });

    return true; // Manter listener aberto para resposta async
  }
});

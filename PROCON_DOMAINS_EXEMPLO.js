// Adicione os domínios suspeitos conhecidos do PROCON-SP aqui
// Esta é uma lista de exemplo - VOCÊ DEVE PESQUISAR E ADICIONAR OS REAIS

const PROCON_DOMAINS = [
  // Exemplo de falsos positivos de Amazon
  "amaazzon.com",
  "amazon-br.com",
  "amazn.com",
  "amazon-official.com",
  
  // Exemplo de falsos positivos de PayPal
  "paypa1.com",        // letra "l" minúscula em lugar de "1"
  "paypa-security.com",
  "paypal-verification.com",
  
  // Exemplo de falsos positivos de Mercado Livre
  "mercadolibre-br.com",
  "mercadolivre-oficial.com",
  
  // Adicione AQUI os domínios do PROCON-SP conforme encontre
  // Você pode pesquisar em:
  // - https://www.procon.sp.gov.br/ (seção de fraudes/phishing)
  // - Alertas de segurança publicados
  // - Denúncias de usuários
];

// Como usar:
// 1. Copie todos os domínios acima
// 2. Abra content.js
// 3. Procure por: const SUSPICIOUS_DOMAINS = [
// 4. Cole os domínios dentro dos colchetes []
// 5. Recarregue a extensão em chrome://extensions/

console.log("Total de domínios suspeitos configurados:", PROCON_DOMAINS.length);
console.log("Domínios:", PROCON_DOMAINS.join(", "));

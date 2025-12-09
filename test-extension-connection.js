// Script para testar conectividade entre extensão e servidor
// Use no console do Service Worker (background.js DevTools)

async function testConnection() {
  console.log("🔍 Testando conexão com servidor local...\n");

  try {
    console.log("1️⃣ Testando http://localhost:3000/api/test (GET simples)");
    const testRes = await fetch("http://localhost:3000/api/test", {
      method: "GET"
    });
    console.log(`   Status: ${testRes.status} ${testRes.statusText}`);
    const testData = await testRes.json();
    console.log(`   Resposta: ${JSON.stringify(testData)}`);
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`);
    return;
  }

  try {
    console.log("\n2️⃣ Testando http://localhost:3000/api/status (GET status)");
    const statusRes = await fetch("http://localhost:3000/api/status", {
      method: "GET"
    });
    console.log(`   Status: ${statusRes.status} ${statusRes.statusText}`);
    const statusData = await statusRes.json();
    console.log(`   Resposta: ${JSON.stringify(statusData, null, 2)}`);
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`);
    return;
  }

  try {
    console.log("\n3️⃣ Testando POST para http://localhost:3000/api/validateDomain");
    const validateRes = await fetch("http://localhost:3000/api/validateDomain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://www.google.com" })
    });
    console.log(`   Status: ${validateRes.status} ${validateRes.statusText}`);
    const validateData = await validateRes.json();
    console.log(`   Resposta: ${JSON.stringify(validateData, null, 2)}`);
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`);
    return;
  }

  console.log("\n✅ Todos os testes passaram! Servidor está respondendo corretamente.");
}

// Execute rodando no console do Service Worker:
// testConnection()

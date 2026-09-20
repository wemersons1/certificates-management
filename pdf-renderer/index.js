const express = require('express');
const playwright = require('playwright');

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

app.post('/render-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'O conteúdo HTML é obrigatório.' });
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    // Criar um contexto isolado
    const context = await browser.newContext();
    const page = await context.newPage();

    // Definir um timeout de 30 segundos para esta operação específica (evita travar o container)
    await page.setContent(html, { 
      waitUntil: 'load', // Mais rápido e seguro que networkidle
      timeout: 30000 
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    
    const base64String = pdfBuffer.toString('base64');
    res.status(200).json({ base64: base64String });

  } catch (error) {
    console.error('Erro ao renderizar o PDF:', error.message);
    res.status(500).json({ error: 'Erro ao renderizar PDF', details: error.message });
  } finally {
    if (browser) {
      // Fechamento garantido para evitar processos zumbis
      await browser.close().catch(err => console.error("Erro ao fechar browser:", err));
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor de renderização iniciado em http://localhost:${port}`);
});
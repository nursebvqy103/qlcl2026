import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registrationSourceUrl =
  'https://script.google.com/macros/s/AKfycbz2h4SAcAObTyHcf3l_ZXYYIN_Dz7Bf3sQs7iRCxMDdBjR1H8f8WLIgCvtJZT8aT4Xx/exec';

function stripTrainingDocuments(html: string) {
  return html
    .replace(
      /\\x3chr[\s\S]*?Tài liệu tập huấn[\s\S]*?documentList[\s\S]*?\\x3c\\\\\\\/div\\x3e\\n?/g,
      '',
    )
    .replace(/window\.addEventListener\(\\\x22load\\\x22,\s*loadDocuments\);/g, '');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/registration-form', async (_req, res) => {
    try {
      const response = await fetch(registrationSourceUrl, {
        redirect: 'follow',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Registration form returned ${response.status}`);
      }

      const html = await response.text();
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.send(stripTrainingDocuments(html));
    } catch (error) {
      console.error('Không tải được form đăng ký:', error);
      res.status(502).send('Không tải được form đăng ký. Vui lòng thử lại sau.');
    }
  });

  // Tích hợp Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy: http://localhost:${PORT}`);
  });
}

startServer();

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateFromHtml(html: string): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      return Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf as Uint8Array);
    } catch (err) {
      this.logger.error('Erro ao gerar PDF', err);
      throw new InternalServerErrorException('Falha ao gerar PDF');
    } finally {
      if (browser) await browser.close();
    }
  }
}

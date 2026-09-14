import { supabase } from './supabase.js';

export const ocrService = {
  async extractFromImage(imageFile) {
    const { default: Tesseract } = await import('tesseract.js');
    const { default: DOMPurify } = await import('dompurify');
    
    const { data: { text } } = await Tesseract.recognize(imageFile, 'id');
    const cleanText = DOMPurify.sanitize(text);
    
    const lines = cleanText.split('\n').filter(l => l.trim());
    const items = [];
    let total = 0;
    
    for (const line of lines) {
      const match = line.match(/(\d[\d,.]*)\s*(Rp)?/);
      if (match) {
        const amount = parseFloat(match[1].replace(/[,.]/g, ''));
        if (!isNaN(amount) && amount > 0) {
          items.push({ description: line.replace(match[1], '').trim(), amount });
          total += amount;
        }
      }
    }
    
    return { items, total, rawText: cleanText };
  }
};

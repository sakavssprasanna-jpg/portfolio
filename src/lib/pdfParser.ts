import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker using same-origin Vite bundled asset (avoids CORS SecurityError)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // 1. If plain text document (.txt, .md), read directly
  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileType.startsWith('text/')) {
    const rawText = await file.text();
    const cleanText = rawText.trim();
    if (!cleanText || cleanText.length === 0) {
      throw new Error('Could not extract readable text from this document. The file is empty.');
    }
    return cleanText;
  }

  // 2. Parse PDF binary stream
  try {
    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('The uploaded file is empty.');
    }

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;

    if (!pdf || pdf.numPages === 0) {
      throw new Error('Could not extract readable text from this PDF. Please upload a text-based PDF.');
    }

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== 'string') continue;

        // Check if item starts on a new vertical line
        const itemY = item.transform ? item.transform[5] : null;
        if (lastY !== null && itemY !== null && Math.abs(itemY - lastY) > 5) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = itemY;
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      fullText += pageLines.join('\n') + '\n\n';
    }

    const cleaned = fullText.trim();

    // Verify text contains real readable characters (not just whitespace or binary garbage)
    if (!cleaned || cleaned.length < 20 || cleaned.startsWith('%PDF')) {
      throw new Error('Could not extract readable text from this PDF. Please upload a text-based PDF.');
    }

    return cleaned;
  } catch (error: any) {
    console.error('PDF extraction failure:', error);
    // Never return raw binary PDF bytes; return user-actionable error
    const msg = error?.message || '';
    if (msg.includes('text-based PDF') || msg.includes('empty')) {
      throw error;
    }
    throw new Error('Could not extract readable text from this PDF. Please upload a text-based PDF.');
  }
}

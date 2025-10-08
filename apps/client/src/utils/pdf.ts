import { PDFParse } from "https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/browser/pdf-parse.es.js";

async function parsePdf(pdf: File[], length?: number): Promise<string[]>;
async function parsePdf(pdf: File, length?: number): Promise<string>;

async function parsePdf(
  pdf: File[] | File,
  length: number = 5000
): Promise<string | string[]> {
  if (Array.isArray(pdf)) {
    const fileArr = await Promise.all(
      pdf.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
        const pdfText = await parser.getText();
        return pdfText.text.slice(0, length);
      })
    );
    return fileArr;
  } else {
    const arrayBuffer = await pdf.arrayBuffer();
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    const pdfText = await parser.getText();
    return pdfText.text.slice(0, length);
  }
}

export { parsePdf };

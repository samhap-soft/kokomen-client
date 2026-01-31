"use client"

import { Document, Page, pdfjs } from "react-pdf";
import { JSX } from "react";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";


// workerSrc 정의 하지 않으면 pdf 보여지지 않습니다.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  };

type PdfViewerProps = {
  fileUrl: string;
  pageNumber: number;
  // eslint-disable-next-line no-unused-vars
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
};

export default function PdfViewer({
  fileUrl,
  pageNumber,
  onLoadSuccess
}: PdfViewerProps): JSX.Element {
    // const [isLoading, setIsLoading] = useState(true);

  return (
    <Document
      file={fileUrl}
      options={options}
      onLoadSuccess={({numPages}) => 
        {
                onLoadSuccess({ numPages });
        }}
      error={
        <div className="text-center py-12 text-text-secondary">
          <p>PDF를 불러올 수 없습니다.</p>
          <p className="text-sm mt-2">
            파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.
          </p>
        </div>
      }
    >
      <Page
        pageNumber={pageNumber}
        width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 100 : 800)}
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />
    </Document>
  );
}

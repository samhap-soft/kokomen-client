"use client"

import { getArchivedResumes } from "@/domains/resume/api";
import { ArchivedResumeAndPortfolio, CamelCasedProperties } from "@kokomen/types";
import { archiveKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Modal } from "@kokomen/ui";
import { FileText, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// eslint-disable-next-line @rushstack/typedef-var
const PdfViewer = dynamic(
  () => import("../components/pdfViewer"),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  }
);


type TabType = "RESUME" | "PORTFOLIO";


export default function ArchivePreview() {
  const [activeTab, setActiveTab] = useState<TabType>("RESUME");
  const [selectedFile, setSelectedFile] =
    useState<CamelCasedProperties<ArchivedResumeAndPortfolio> | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: archiveKeys.resumes("ALL"),
    queryFn: () => getArchivedResumes("ALL"),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 5
  });

  const resumes = data?.resumes || [];
  const portfolios = data?.portfolios || [];

  const currentList =
    activeTab === "RESUME" ? resumes : portfolios;

  const handleFileSelect = (
    file: CamelCasedProperties<ArchivedResumeAndPortfolio>
  ): void => {
    setSelectedFile(file);
    setPageNumber(1);
    setNumPages(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPageNumber(1);
    setNumPages(undefined);
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    console.log('numPages', numPages);
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = (): void => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = (): void => {
    setPageNumber((prev) => Math.min(numPages || 0, prev + 1));
  };


  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            아카이브 미리보기
          </h1>
          <p className="text-text-secondary">
            아카이빙된 이력서와 포트폴리오를 미리보기할 수 있습니다
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            아카이브 미리보기
          </h1>
          <p className="text-text-secondary">
            아카이빙된 이력서와 포트폴리오를 미리보기할 수 있습니다
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-text-secondary">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          아카이브 미리보기
        </h1>
        <p className="text-text-secondary">
          아카이빙된 이력서와 포트폴리오를 미리보기할 수 있습니다
        </p>
      </div>

      <div className="max-w-4xl">
        {/* 파일 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          {/* 탭 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "RESUME" ? "primary" : "glass"}
              size="small"
              onClick={() => {
                setActiveTab("RESUME");
              }}
              className="flex-1"
            >
              이력서
            </Button>
            <Button
              variant={activeTab === "PORTFOLIO" ? "primary" : "glass"}
              size="small"
              onClick={() => {
                setActiveTab("PORTFOLIO");
              }}
              className="flex-1"
            >
              포트폴리오
            </Button>
          </div>

          {/* 파일 리스트 */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {currentList.length === 0 ? (
              <div className="text-center py-8 text-text-tertiary">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {activeTab === "RESUME"
                    ? "아카이빙된 이력서가 없습니다"
                    : "아카이빙된 포트폴리오가 없습니다"}
                </p>
              </div>
            ) : (
              currentList.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleFileSelect(file)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary-border hover:bg-fill-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.title}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {new Date(file.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PDF 미리보기 모달 */}
      {selectedFile && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedFile.title}
          size="4xl"
          escToClose={true}
        >
          <div className="mb-4">
            <p className="text-sm text-text-secondary">
              {new Date(selectedFile.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-gray-50">
            <div className="flex items-center flex-col justify-center p-4 bg-white border-b border-border">
              <PdfViewer
                fileUrl={selectedFile.url}
                pageNumber={pageNumber}
                onLoadSuccess={handleDocumentLoadSuccess}
              />
              <div className="flex items-center gap-4">
                <Button
                  variant="glass"
                  size="small"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  이전
                </Button>
                <span className="text-sm text-text-secondary">
                  {pageNumber} / {numPages || "-"}
                </span>
                <Button
                  variant="glass"
                  size="small"
                  onClick={goToNextPage}
                  disabled={pageNumber >= (numPages || 0)}
                >
                  다음
                </Button>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </div>
  );
}

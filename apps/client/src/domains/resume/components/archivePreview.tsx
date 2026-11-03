"use client";
import { formatDotDate } from "@/utils/date";

import { getArchivedResumes } from "@/domains/resume/api";
import {
  ArchivedResumeAndPortfolio,
  CamelCasedProperties
} from "@kokomen/types";
import { archiveKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Chip, Modal } from "@kokomen/ui";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// eslint-disable-next-line @rushstack/typedef-var
const PdfViewer = dynamic(() => import("../components/pdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
});

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

  const currentList = activeTab === "RESUME" ? resumes : portfolios;

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

  const handleDocumentLoadSuccess = ({
    numPages
  }: {
    numPages: number;
  }): void => {
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
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-text-primary">아카이브</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-text-primary">아카이브</h2>
        <div className="py-12 text-center">
          <p className="text-text-secondary">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-text-primary">아카이브</h2>

      <div className="flex gap-2" role="group" aria-label="문서 종류">
        {(
          [
            { label: "이력서", value: "RESUME" },
            { label: "포트폴리오", value: "PORTFOLIO" }
          ] as const
        ).map((tab) => (
          <Chip
            key={tab.value}
            size="large"
            active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Chip>
        ))}
      </div>

      {currentList.length === 0 ? (
        <p className="py-12 text-center text-text-tertiary">
          {activeTab === "RESUME"
            ? "아카이빙된 이력서가 없습니다"
            : "아카이빙된 포트폴리오가 없습니다"}
        </p>
      ) : (
        <ul className="flex flex-col">
          {currentList.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-4 border-b border-border py-6"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="truncate text-xl font-semibold text-text-primary">
                  {file.title}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDotDate(file.createdAt)} · PDF
                </p>
              </div>
              <Button
                variant="secondary"
                size="large"
                onClick={() => handleFileSelect(file)}
              >
                미리보기
              </Button>
            </li>
          ))}
        </ul>
      )}

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
                  variant="secondary"
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
                  variant="secondary"
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

import { useQuery } from "@tanstack/react-query";
import { Select } from "@kokomen/ui";
import { InterviewQuestion } from "@kokomen/types";
import { JSX, useState } from "react";
import { getAdminQuestions } from "@/domains/admin/api";
import { adminQuestionKeys } from "@/utils/querykeys";
import RootQuestionCard from "./rootQuestionCard";
import RootQuestionEditModal from "./rootQuestionEditModal";
import RootQuestionDeleteModal from "./rootQuestionDeleteModal";

const CATEGORY_OPTIONS = [
  { value: "ALGORITHM_DATA_STRUCTURE", label: "알고리즘/자료구조" },
  { value: "DATABASE", label: "데이터베이스" },
  { value: "NETWORK", label: "네트워크" },
  { value: "OPERATING_SYSTEM", label: "운영체제" },
  { value: "JAVA_SPRING", label: "자바/스프링" },
  { value: "INFRA", label: "인프라" },
  { value: "FRONTEND", label: "프론트엔드" },
  { value: "REACT", label: "리액트" },
  { value: "JAVASCRIPT_TYPESCRIPT", label: "자바스크립트/타입스크립트" }
];

const RootQuestionList = (): JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORY_OPTIONS[0].value
  );
  const [editTarget, setEditTarget] = useState<InterviewQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InterviewQuestion | null>(
    null
  );

  const { data: questions, isLoading } = useQuery({
    queryKey: adminQuestionKeys.byCategory(selectedCategory),
    queryFn: () => getAdminQuestions(selectedCategory)
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">루트질문 관리</h2>
      <div className="mb-6 max-w-xs">
        <Select
          options={CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value as string)}
          aria-label="카테고리 선택"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          로딩 중...
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {questions.map((question) => (
            <RootQuestionCard
              key={question.id}
              question={question}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 py-8 text-center">
          해당 카테고리에 질문이 없습니다.
        </div>
      )}

      <RootQuestionEditModal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        question={editTarget}
      />
      <RootQuestionDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        question={deleteTarget}
      />
    </div>
  );
};

export default RootQuestionList;

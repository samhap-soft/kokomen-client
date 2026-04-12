import { Button } from "@kokomen/ui";
import { InterviewQuestion } from "@kokomen/types";
import { Pencil, Trash2 } from "lucide-react";
import { JSX } from "react";

interface RootQuestionCardProps {
  question: InterviewQuestion;
  // eslint-disable-next-line no-unused-vars
  onEdit: (question: InterviewQuestion) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (question: InterviewQuestion) => void;
}

const RootQuestionCard = ({
  question,
  onEdit,
  onDelete
}: RootQuestionCardProps): JSX.Element => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-400 mr-2">#{question.id}</span>
        <span className="text-sm text-gray-900">{question.content}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="soft"
          size="small"
          onClick={() => onEdit(question)}
          className="[&_svg]:size-4"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="soft"
          size="small"
          onClick={() => onDelete(question)}
          className="[&_svg]:size-4 text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RootQuestionCard;

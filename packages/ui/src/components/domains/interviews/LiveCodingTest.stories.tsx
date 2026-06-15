import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import LiveCodingTest from "./liveCodingTest";

const SAMPLE_PROBLEM = `# Two Sum

주어진 정수 배열 \`nums\`와 정수 \`target\`이 있을 때, 합이 \`target\`이 되는 두 수의 인덱스를 반환하세요.

## 예시

### 입력
\`\`\`
nums = [2, 7, 11, 15], target = 9
\`\`\`

### 출력
\`\`\`
[0, 1]
\`\`\`

## 제약 조건

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- 정답은 정확히 하나만 존재합니다.
- 같은 원소를 두 번 사용할 수 없습니다.

## 힌트

> 해시맵을 활용하면 O(n) 시간복잡도로 풀 수 있습니다.
`;

const SAMPLE_CODE_JS = `function twoSum(nums, target) {
  // 여기에 코드를 작성하세요

}`;

const SAMPLE_CODE_PY = `def two_sum(nums: list[int], target: int) -> list[int]:
    # 여기에 코드를 작성하세요
    pass
`;

const meta: Meta<typeof LiveCodingTest> = {
  title: "Domains/Interviews/LiveCodingTest",
  component: LiveCodingTest,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onClose: fn(),
    isOpen: true,
    problemMarkdown: SAMPLE_PROBLEM,
    defaultCode: SAMPLE_CODE_JS,
    language: "javascript",
    timeLimitSeconds: 600,
    isSubmitting: false,
  },
};

export default meta;
type Story = StoryObj<typeof LiveCodingTest>;

export const Default: Story = {};

export const PythonSelected: Story = {
  args: {
    language: "python",
    defaultCode: SAMPLE_CODE_PY,
  },
};

export const TimeAlmostUp: Story = {
  args: {
    timeLimitSeconds: 30,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

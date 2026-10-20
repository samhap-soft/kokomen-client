import { Tab } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { JSX, useState } from "react";

const meta: Meta<typeof Tab> = {
  title: "Common/Tab",
  component: Tab,
  parameters: {
    layout: "centered",
    backgrounds: { default: "layout", values: [{ name: "layout", value: "#f5f5f5" }] }
  },
  tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof Tab>;

const TabTemplate = (): JSX.Element => {
  const [selected, setSelected] = useState("text");
  return (
    <Tab className="w-[412px]">
      <Tab.Item selected={selected === "text"} onClick={() => setSelected("text")}>
        텍스트
      </Tab.Item>
      <Tab.Item selected={selected === "voice"} onClick={() => setSelected("voice")}>
        음성
      </Tab.Item>
    </Tab>
  );
};

export const Default: Story = {
  render: () => <TabTemplate />
};

export const WithDisabledItem: Story = {
  render: () => (
    <Tab className="w-[412px]">
      <Tab.Item selected>텍스트</Tab.Item>
      <Tab.Item disabled>음성</Tab.Item>
    </Tab>
  )
};

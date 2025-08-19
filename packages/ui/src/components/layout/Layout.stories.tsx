import type { Meta, StoryObj } from "@storybook/react";
import { Layout } from "./index";

const meta: Meta<typeof Layout> = {
  title: "Components/Layout",
  component: Layout,
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Layout>
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            기본 레이아웃
          </h1>
          <p className="text-gray-600">이것은 기본 레이아웃 컴포넌트입니다.</p>
        </div>
      </div>
    </Layout>
  )
};

export const WithHeader: Story = {
  render: () => (
    <Layout>
      <div className="flex flex-col h-full">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">헤더</h1>
        </header>
        <main className="flex-1 bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">메인 콘텐츠</h2>
            <p className="text-gray-600">
              이 레이아웃은 헤더와 메인 콘텐츠 영역을 포함합니다.
            </p>
          </div>
        </main>
      </div>
    </Layout>
  )
};

export const WithSidebar: Story = {
  render: () => (
    <Layout>
      <div className="flex h-full">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">사이드바</h2>
          <nav className="space-y-2">
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              대시보드
            </a>
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              사용자
            </a>
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              설정
            </a>
          </nav>
        </aside>
        <main className="flex-1 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold mb-4">메인 콘텐츠</h2>
          <p className="text-gray-600">
            이 레이아웃은 사이드바와 메인 콘텐츠 영역을 포함합니다.
          </p>
        </main>
      </div>
    </Layout>
  )
};

export const ComplexLayout: Story = {
  render: () => (
    <Layout>
      <div className="flex flex-col h-full">
        <header className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">애플리케이션</h1>
            <nav className="space-x-4">
              <a href="#" className="hover:text-blue-200">
                홈
              </a>
              <a href="#" className="hover:text-blue-200">
                프로필
              </a>
              <a href="#" className="hover:text-blue-200">
                설정
              </a>
            </nav>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="w-64 bg-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-4">사이드바</h2>
            <nav className="space-y-2">
              <a href="#" className="block p-2 hover:bg-gray-200 rounded">
                대시보드
              </a>
              <a href="#" className="block p-2 hover:bg-gray-200 rounded">
                사용자 관리
              </a>
              <a href="#" className="block p-2 hover:bg-gray-200 rounded">
                보고서
              </a>
              <a href="#" className="block p-2 hover:bg-gray-200 rounded">
                설정
              </a>
            </nav>
          </aside>

          <main className="flex-1 bg-white p-6">
            <h2 className="text-2xl font-bold mb-4">대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">통계</h3>
                <p className="text-blue-700">123,456</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">성공률</h3>
                <p className="text-green-700">98.5%</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900">활성 사용자</h3>
                <p className="text-yellow-700">1,234</p>
              </div>
            </div>
          </main>
        </div>

        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2024 애플리케이션. 모든 권리 보유.</p>
        </footer>
      </div>
    </Layout>
  )
};

export const CustomHeight: Story = {
  render: () => (
    <Layout className="min-h-[500px]">
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">커스텀 높이</h1>
          <p className="text-gray-600">
            이 레이아웃은 커스텀 최소 높이를 가집니다.
          </p>
        </div>
      </div>
    </Layout>
  )
};

export const ResponsiveLayout: Story = {
  render: () => (
    <Layout>
      <div className="flex flex-col lg:flex-row h-full">
        <aside className="w-full lg:w-64 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">반응형 사이드바</h2>
          <nav className="space-y-2">
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              대시보드
            </a>
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              사용자
            </a>
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">
              설정
            </a>
          </nav>
        </aside>
        <main className="flex-1 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold mb-4">반응형 메인 콘텐츠</h2>
          <p className="text-gray-600">
            이 레이아웃은 화면 크기에 따라 반응형으로 동작합니다. 작은
            화면에서는 세로로, 큰 화면에서는 가로로 배치됩니다.
          </p>
        </main>
      </div>
    </Layout>
  )
};

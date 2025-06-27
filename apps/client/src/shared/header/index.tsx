import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { JSX } from "react";

const navigation: { href: string; label: string; current: boolean }[] = [
  { href: "/", label: "홈", current: true },
  { href: "/interviews", label: "면접", current: false },
];

export default function Header(): JSX.Element {
  const location = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="꼬꼬면 로고"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

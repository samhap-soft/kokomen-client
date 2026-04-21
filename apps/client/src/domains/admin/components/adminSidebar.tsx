import { Button } from "@kokomen/ui";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/router";
import { JSX } from "react";

const sidebarItems = [
  {
    href: "/admin/payments",
    label: "결제 내역",
    icon: CreditCard
  }
];

const AdminSidebar = (): JSX.Element => {
  const router = useRouter();

  return (
    <aside className="w-56 shrink-0">
      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              variant="none"
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 justify-start [&_svg]:size-4 ${
                isActive
                  ? "bg-primary-bg-light text-primary border border-primary-border"
                  : "text-text-primary hover:bg-primary-bg-hover"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

import { Noto_Sans_JP } from "next/font/google";
import { AdminSidebar } from "@/components/admin/sidebar";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${notoSans.className} flex min-h-screen bg-[#F5F5F5] text-[#333]`}>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

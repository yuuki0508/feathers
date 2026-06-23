import { Noto_Sans_JP } from "next/font/google";
import { AdminShell } from "@/components/admin/admin-shell";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={notoSans.className}><AdminShell>{children}</AdminShell></div>;
}

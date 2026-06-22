import { BottomNav } from "@/components/viewer/bottom-nav";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[390px] bg-cream pb-20 text-text">
      {children}
      <BottomNav />
    </div>
  );
}

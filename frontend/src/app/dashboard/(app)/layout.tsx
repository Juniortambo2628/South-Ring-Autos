import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

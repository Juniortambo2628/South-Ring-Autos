import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ProfileAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

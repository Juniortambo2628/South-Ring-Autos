import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminLayout>{children}</AdminLayout>;
}

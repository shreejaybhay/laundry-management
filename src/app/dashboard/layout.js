import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function Layout({ children }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full min-h-0">
        {children}
      </div>
    </DashboardLayout>
  );
}

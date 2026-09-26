import Navbar from '@/components/navbar';
import RoleGuard from '@/components/role-guard';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <Navbar />
      <main className="pt-14 min-h-screen bg-canvas">{children}</main>
    </RoleGuard>
  );
}

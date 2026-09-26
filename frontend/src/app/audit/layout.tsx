import Navbar from '@/components/navbar';
import RoleGuard from '@/components/role-guard';

export default function AuditLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard allowedRoles={['AUDITOR']}>
      <Navbar />
      <main className="pt-14 min-h-screen bg-canvas">{children}</main>
    </RoleGuard>
  );
}

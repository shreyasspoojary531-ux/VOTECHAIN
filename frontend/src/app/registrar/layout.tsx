import Navbar from '@/components/Navbar';
import RoleGuard from '@/components/role-guard';

export default function RegistrarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard allowedRoles={['REGISTRAR']}>
      <Navbar />
      <main className="pt-14 min-h-screen bg-canvas">{children}</main>
    </RoleGuard>
  );
}

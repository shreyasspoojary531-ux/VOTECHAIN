import Navbar from '@/components/Navbar';

export default function ElectionsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-canvas">{children}</main>
    </>
  );
}

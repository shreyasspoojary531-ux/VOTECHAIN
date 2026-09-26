import Navbar from '@/components/navbar';

export default function BlockchainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-canvas">{children}</main>
    </>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Role guard (admin-only access) arrives with the auth prompt.
  return children;
}

export default function RegistrarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Role guard (registrar-only access) arrives with the auth prompt.
  return children;
}

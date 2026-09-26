export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Role guard (auditor-only access) arrives with the auth prompt.
  return children;
}

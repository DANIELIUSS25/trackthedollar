// src/app/(public)/layout.tsx — Layout for public (non-dashboard) pages
interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>{children}</>;
}

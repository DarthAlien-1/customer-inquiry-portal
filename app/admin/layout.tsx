import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Inquiry Admin Dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
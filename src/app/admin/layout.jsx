import AdminClientLayout from '../../components/admin/AdminClientLayout';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}

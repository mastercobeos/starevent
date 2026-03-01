import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboardPage from '../../components/admin/AdminDashboardPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <AdminDashboardPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}

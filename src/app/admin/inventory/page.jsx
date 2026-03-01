import ProtectedRoute from '../../../components/admin/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import InventorySummaryPage from '../../../components/admin/InventorySummaryPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <InventorySummaryPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}

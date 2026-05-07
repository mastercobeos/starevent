import ProtectedRoute from '../../../components/admin/ProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import TaxReportPage from '../../../components/admin/TaxReportPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <TaxReportPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}

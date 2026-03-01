import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import AdminLayout from '../../../../components/admin/AdminLayout';
import ReservationDetailPage from '../../../../components/admin/ReservationDetailPage';

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ReservationDetailPage id={id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}

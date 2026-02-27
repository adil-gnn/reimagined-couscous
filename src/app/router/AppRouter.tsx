import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AdminRouteGuard } from '../../features/adminAuth/components/AdminRouteGuard';
import { RequireAdminRoles } from '../../features/adminAuth/components/RequireAdminRoles';
import { AdminLayoutPage } from '../../features/adminAuth/pages/AdminLayoutPage';
import { AdminLoginPage } from '../../features/adminAuth/pages/AdminLoginPage';
import { AdminPlanningPage } from '../../features/adminPlanning/pages/AdminPlanningPage';
import { AdminServicesPage } from '../../features/adminServices/pages/AdminServicesPage';
import { AdminStaffPage } from '../../features/adminStaff/pages/AdminStaffPage';
import { PublicBookingPage } from '../../features/publicBooking/pages/PublicBookingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/booking/demo" replace />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <AdminRouteGuard />,
    children: [
      {
        element: <AdminLayoutPage />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/planning" replace />,
          },
          {
            path: 'planning',
            element: <AdminPlanningPage />,
          },
          {
            path: 'services',
            element: (
              <RequireAdminRoles allowed={['ADMIN']}>
                <AdminServicesPage />
              </RequireAdminRoles>
            ),
          },
          {
            path: 'staff',
            element: (
              <RequireAdminRoles allowed={['ADMIN']}>
                <AdminStaffPage />
              </RequireAdminRoles>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/booking/:slug',
    element: <PublicBookingPage />,
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}

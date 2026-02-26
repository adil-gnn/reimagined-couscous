import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PublicBookingPage } from '../../features/publicBooking/pages/PublicBookingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/booking/demo" replace />,
  },
  {
    path: '/booking/:slug',
    element: <PublicBookingPage />,
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}

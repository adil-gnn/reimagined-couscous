import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminAppointment } from '../api/adminPlanningApi';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

type UpdateAdminAppointmentInput = {
  tenantSlug: string;
  date: string;
  appointmentId: string;
  body: {
    service_id: string;
    start_at: string;
    staff_id?: string;
  };
};

export function useUpdateAdminAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminAppointmentInput) =>
      updateAdminAppointment({
        appointmentId: input.appointmentId,
        body: input.body,
      }),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminPlanningQueryKeys.day(variables.date),
        }),
        queryClient.invalidateQueries({
          queryKey: ['admin-planning', 'slots', variables.tenantSlug],
        }),
      ]);
    },
  });
}


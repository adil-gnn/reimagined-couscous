import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminAppointmentStatus } from '../api/adminPlanningApi';
import { AdminUpdatableStatus } from '../types/adminPlanningTypes';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

type UpdateAdminAppointmentStatusInput = {
  date: string;
  appointmentId: string;
  status: AdminUpdatableStatus;
};

export function useUpdateAdminAppointmentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminAppointmentStatusInput) =>
      updateAdminAppointmentStatus({
        appointmentId: input.appointmentId,
        body: { status: input.status },
      }),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: adminPlanningQueryKeys.day(variables.date),
      });
    },
  });
}


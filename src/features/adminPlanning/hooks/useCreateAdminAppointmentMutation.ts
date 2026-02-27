import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminAppointment } from '../api/adminPlanningApi';
import { CreateAdminAppointmentRequest } from '../types/adminPlanningTypes';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

type CreateAdminAppointmentInput = {
  date: string;
  tenantSlug: string;
  serviceId: string;
  staffId?: string;
  idempotencyKey: string;
  body: CreateAdminAppointmentRequest;
};

export function useCreateAdminAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdminAppointmentInput) =>
      createAdminAppointment({
        idempotencyKey: input.idempotencyKey,
        body: input.body,
      }),
    onSuccess: async (_result, variables) => {
      // Rafraîchit les données server-side impactées par la création.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPlanningQueryKeys.day(variables.date) }),
        queryClient.invalidateQueries({
          queryKey: adminPlanningQueryKeys.slots(
            variables.tenantSlug,
            variables.serviceId,
            variables.date,
            variables.staffId,
          ),
        }),
      ]);
    },
  });
}

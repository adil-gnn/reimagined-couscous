import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPublicAppointment } from '../api/publicBookingApi';
import { CreatePublicAppointmentRequestBody } from '../types/publicBookingApiTypes';

type CreatePublicAppointmentInput = {
  slug: string;
  idempotencyKey: string;
  body: CreatePublicAppointmentRequestBody;
};

export function useCreatePublicAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePublicAppointmentInput) =>
      createPublicAppointment({
        slug: input.slug,
        idempotencyKey: input.idempotencyKey,
        body: input.body,
      }),
    onSuccess: async (_result, variables) => {
      // Après création, on rafraîchit les slots du tenant (source de vérité backend).
      await queryClient.invalidateQueries({ queryKey: ['slots', variables.slug] });
    },
  });
}

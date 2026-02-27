import { SectionMessage } from '../../publicBooking/components/SectionMessage';

type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps): JSX.Element {
  return (
    <section className="booking-section">
      <h2>{title}</h2>
      <SectionMessage tone="info" message="Ecran a venir dans les prochaines etapes." />
    </section>
  );
}

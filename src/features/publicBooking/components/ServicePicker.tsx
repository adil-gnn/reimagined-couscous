import { PublicService } from '../types/publicBookingApiTypes';

type ServicePickerProps = {
  services: PublicService[];
  selectedServiceId: string;
  onSelect: (serviceId: string) => void;
};

export function ServicePicker({ services, selectedServiceId, onSelect }: ServicePickerProps): JSX.Element {
  return (
    <div className="service-list" role="list" aria-label="Services disponibles">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;

        return (
          <button
            key={service.id}
            type="button"
            className={`service-button ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelect(service.id)}
          >
            <span className="service-button__name">{service.name}</span>
            <span className="service-button__meta">{service.duration_minutes} min</span>
          </button>
        );
      })}
    </div>
  );
}

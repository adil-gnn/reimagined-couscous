import { formatSlotTime } from '../../../shared/utils/dateTime';

type Slot = {
  start_at: string;
};

type SlotsGridProps = {
  slots: Slot[];
  selectedSlotStartAt: string;
  timezone: string;
  onSelect: (startAt: string) => void;
};

export function SlotsGrid({ slots, selectedSlotStartAt, timezone, onSelect }: SlotsGridProps): JSX.Element {
  return (
    <div className="slots-grid" role="list" aria-label="Créneaux disponibles">
      {slots.map((slot) => {
        const isSelected = slot.start_at === selectedSlotStartAt;

        return (
          <button
            key={slot.start_at}
            type="button"
            className={`slot-button ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelect(slot.start_at)}
          >
            {formatSlotTime(slot.start_at, timezone)}
          </button>
        );
      })}
    </div>
  );
}

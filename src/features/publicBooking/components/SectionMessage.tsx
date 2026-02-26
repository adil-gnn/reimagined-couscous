type SectionMessageProps = {
  tone: 'loading' | 'error' | 'empty' | 'info';
  message: string;
};

export function SectionMessage({ tone, message }: SectionMessageProps): JSX.Element {
  return <p className={`section-message section-message--${tone}`}>{message}</p>;
}

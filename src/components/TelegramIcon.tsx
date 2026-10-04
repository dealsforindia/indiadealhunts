import type { SVGProps } from 'react';

/** The paper plane is legible even at small sizes; its container supplies the blue. */
export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.7 3.5 18.5 20c-.24 1.17-.9 1.45-1.83.9l-4.89-3.61-2.36 2.28c-.26.26-.48.48-.98.48l.35-4.99 9.08-8.2c.4-.35-.09-.55-.62-.2L6.03 13.72l-4.83-1.51c-1.05-.33-1.07-1.05.22-1.55L20.3 3.38c.87-.32 1.63.2 1.4.12Z" />
  </svg>;
}

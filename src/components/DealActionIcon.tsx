import type { SVGProps } from 'react';

type Action = 'scan' | 'cart' | 'store' | 'zoom' | 'copy' | 'expired' | 'shield' | 'bolt' | 'tag';

/** Authored on one 24px grid for the product-detail action family. */
export function DealActionIcon({ kind, ...props }: SVGProps<SVGSVGElement> & { kind: Action }) {
  return <svg {...props} className={`deal-action-icon ${props.className || ''}`} data-kind={kind} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === 'scan' && <>
      <path d="M3 7V3h4m10 0h4v4M3 17v4h4m10 0h4v-4" opacity=".55" />
      <path d="m6 10 1.5-4h9L18 10v8H6Z" fill="currentColor" fillOpacity=".1" />
      <path d="M6 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0M10 18v-4h4v4" />
      <path className="scan-line" d="M4 12h16" />
    </>}
    {kind === 'cart' && <><path d="M3 4h2l2.2 11h11l2-8H6" fill="currentColor" fillOpacity=".1" /><path d="M8 11h9" /><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></>}
    {kind === 'store' && <><path d="M13 4h7v7m-1-6-9 9"/><path d="M8 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></>}
    {kind === 'zoom' && <><circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fillOpacity=".08"/><path d="m16 16 5 5M8 10.5h5m-2.5-2.5v5"/></>}
    {kind === 'copy' && <><rect x="8" y="7" width="12" height="14" rx="3" fill="currentColor" fillOpacity=".08"/><path d="M15 4V3H4v14h1"/></>}
    {kind === 'expired' && <><path d="m12 3 10 18H2Z" fill="currentColor" fillOpacity=".08"/><path d="M12 9v5m0 3h.01"/></>}
    {kind === 'shield' && <><path d="m12 3 8 3v6c0 4-5 7-8 9-3-2-8-5-8-9V6Z" fill="currentColor" fillOpacity=".08"/><path d="m8.5 11.5 2.5 2.5 4.5-5"/></>}
    {kind === 'bolt' && <path d="m13 2-8 12h6l-1 8 9-13h-6Z" fill="currentColor" fillOpacity=".1"/>}
    {kind === 'tag' && <><path d="M3 3h8l10 10-8 8L3 11Z" fill="currentColor" fillOpacity=".08"/><circle cx="7.5" cy="7.5" r="1"/></>}
  </svg>;
}

import { ArrowDownRight, Bookmark, ExternalLink, ShieldCheck } from 'lucide-react';
const POINTS = [
  { Icon: ShieldCheck, title: 'Know the source', description: 'Directory offers and external results are clearly labelled.' },
  { Icon: ArrowDownRight, title: 'Look beyond the MRP', description: 'Explore recorded prices where history is available.' },
  { Icon: Bookmark, title: 'Keep the good ones', description: 'Save your finds and compare your shortlist.' },
  { Icon: ExternalLink, title: 'Straight to the store', description: 'Check final prices, delivery and eligibility with the merchant.' },
];
export const TrustStrip = () => <section className="idh-shopping-notes" aria-label="A little more confidence in every find">
  <div className="idh-notes-heading"><span className="idh-eyebrow">SHOP WITH A CLEARER PICTURE</span><h2>Good finds. Informed choices.</h2></div>
  <div className="idh-notes-grid">{POINTS.map(({ Icon, title, description }, index) => <article key={title}><div className="idh-note-top"><Icon size={22} strokeWidth={1.5} /><span>0{index + 1}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
</section>;

import type { ReactNode } from "react";

export function LegalPage({eyebrow,title,intro,children}:{eyebrow:string;title:string;intro:string;children:ReactNode}){
 return <main className="legal-page"><nav><a className="brand" href="/"><span>♥</span> mypookie.</a><a href="/">← Back home</a></nav><article><small>{eyebrow}</small><h1>{title}</h1><p className="legal-intro">{intro}</p><div className="legal-date">Effective 30 July 2026</div>{children}</article><footer><span>© 2026 mypookie.</span><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/refund-policy">Refunds</a><a href="/contact">Contact</a></div></footer></main>;
}

type Faq={question:string;answer:string};

export type SeoGiftLandingProps={
  eyebrow:string;
  title:string;
  intro:string;
  recipient:string;
  ideas:string[];
  steps:string[];
  tips:string[];
  faqs:Faq[];
};

const related=[
  ["Gifts for boyfriend","/gifts-for-boyfriend"],
  ["Gifts for girlfriend","/gifts-for-girlfriend"],
  ["Birthday gifts","/birthday-gifts-online"],
  ["Anniversary gifts","/anniversary-gifts-online"],
  ["Digital love letters","/digital-love-letter"],
  ["Personalized online gifts","/personalized-online-gifts"],
] as const;

export function SeoGiftLanding({eyebrow,title,intro,recipient,ideas,steps,tips,faqs}:SeoGiftLandingProps){
  const structuredData={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(faq=>({"@type":"Question",name:faq.question,acceptedAnswer:{"@type":"Answer",text:faq.answer}}))};
  return <main className="seo-gift-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
    <nav><a className="brand" href="/"><span>♥</span> mypookie.</a><a className="seo-nav-cta" href="/">Create a gift <b>→</b></a></nav>
    <header className="seo-hero">
      <div><small>{eyebrow}</small><h1>{title}</h1><p>{intro}</p><div className="seo-hero-actions"><a href="/">Create {recipient}&apos;s gift <b>→</b></a><a href="#ideas">Explore ideas</a></div><span>No app download · Private sharing · Works on mobile</span></div>
      <aside aria-label="Interactive gift preview"><i>♡</i><small>A LITTLE WORLD FOR THEM</small><strong>Letters, memories and surprises</strong><div><span>✉ Personal letter</span><span>▦ Photo puzzle</span><span>✦ Scratch surprise</span></div></aside>
    </header>
    <section className="seo-section" id="ideas"><small>WHAT TO INCLUDE</small><h2>Ideas that feel personal—not generic</h2><p className="seo-section-intro">Choose a few moments that sound like your relationship. A shorter gift with specific memories usually feels more meaningful than a long collection of generic messages.</p><div className="seo-card-grid">{ideas.map((idea,index)=><article key={idea}><b>{String(index+1).padStart(2,"0")}</b><h3>{idea}</h3><p>Customize the words, photo, activity and reveal so it belongs to the two of you.</p></article>)}</div></section>
    <section className="seo-band"><div><small>HOW IT WORKS</small><h2>From idea to private link</h2></div><ol>{steps.map(step=><li key={step}>{step}</li>)}</ol><a href="/">Start creating <b>→</b></a></section>
    <section className="seo-section seo-tips"><small>MAKE IT MEMORABLE</small><h2>Simple writing tips</h2><div>{tips.map(tip=><article key={tip}><span>♥</span><p>{tip}</p></article>)}</div></section>
    <section className="seo-section seo-faq"><small>QUESTIONS</small><h2>Frequently asked questions</h2>{faqs.map(faq=><details key={faq.question}><summary>{faq.question}<span>＋</span></summary><p>{faq.answer}</p></details>)}</section>
    <section className="seo-related"><h2>Explore more gift ideas</h2><div>{related.map(([label,url])=><a key={url} href={url}>{label}<span>→</span></a>)}</div></section>
    <footer><span>© 2026 mypookie.</span><p>Personalized gifts made to be experienced.</p><div><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div></footer>
  </main>;
}

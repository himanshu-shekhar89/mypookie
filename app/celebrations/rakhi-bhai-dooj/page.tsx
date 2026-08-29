import type { Metadata } from "next";
import Link from "next/link";
import "./rakhi.css";
import RakhiRitual from "./RakhiRitual";

export const metadata: Metadata = {
  title: "Raksha Bandhan & Bhai Dooj Gifts | mypookie.",
  description:
    "Create a playful, personal digital surprise for your sibling with letters, memories, games and a little festive magic.",
  alternates: { canonical: "/celebrations/rakhi-bhai-dooj" },
};

const moments = [
  { icon: "✉", title: "A letter they’ll keep", text: "Say the things that usually get hidden behind teasing." },
  { icon: "▦", title: "A memory puzzle", text: "Turn an old photo into a tiny challenge they unlock." },
  { icon: "?", title: "The sibling quiz", text: "Settle who actually remembers your childhood correctly." },
  { icon: "♫", title: "Your shared soundtrack", text: "Add the song that instantly takes both of you back." },
];

const templates = [
  { emoji: "😂", label: "For the chaos partner", title: "Mostly roasting, secretly wholesome", tone: "Playful" },
  { emoji: "🫶", label: "For long-distance siblings", title: "A little piece of home, online", tone: "Emotional" },
  { emoji: "📸", label: "For the family archivist", title: "From tiny fights to big memories", tone: "Nostalgic" },
];

export default function RakhiBhaiDoojPage() {
  return (
    <main className="rb-page">
      <nav className="rb-nav">
        <Link className="rb-brand" href="/"><span>♥</span>mypookie.</Link>
        <div className="rb-nav-links"><a href="#ideas">Gift ideas</a><a href="#how">How it works</a></div>
        <Link className="rb-small-cta" href="/">Create a surprise <b>→</b></Link>
      </nav>

      <section className="rb-hero">
        <div className="rb-bunting" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="rb-copy">
          <span className="rb-kicker">RAKSHA BANDHAN · BHAI DOOJ</span>
          <h1>For the one who knows <em>every version</em> of you.</h1>
          <p>Turn your inside jokes, childhood photos and unsaid thank-yous into one little interactive world made just for your sibling.</p>
          <div className="rb-actions">
            <Link className="rb-primary" href="/">Make their surprise <span>→</span></Link>
            <a className="rb-text-link" href="#ideas">See what you can add ↓</a>
          </div>
          <div className="rb-proof"><span>⚡ Ready in minutes</span><span>🔒 Shared with one private link</span><span>₹ Starts small, feels priceless</span></div>
        </div>

        <div className="rb-art" aria-label="Cute sibling animals celebrating Raksha Bandhan">
          <div className="rb-halo rb-halo-one" /><div className="rb-halo rb-halo-two" />
          <img src="/celebrations/rakhi-animal-stickers.png" alt="Bear siblings tying a rakhi with a rabbit, elephant and festive stickers" />
          <div className="rb-rakhi rb-rakhi-one" aria-hidden="true"><i /><b>✦</b><i /></div>
          <div className="rb-rakhi rb-rakhi-two" aria-hidden="true"><i /><b>♥</b><i /></div>
          <div className="rb-note"><small>A LITTLE PROMISE</small><strong>“No matter how much we fight…”</strong><span>you’ll always be my person. ♡</span></div>
        </div>
      </section>

      <div className="rb-marquee" aria-hidden="true"><span>ROASTS</span><i>✦</i><span>OLD PHOTOS</span><i>✦</i><span>SECRET NOTES</span><i>✦</i><span>SIBLING QUIZZES</span><i>✦</i><span>BIG FEELINGS</span></div>

      <RakhiRitual />

      <section className="rb-moments" id="ideas">
        <header><span className="rb-kicker">BUILD IT YOUR WAY</span><h2>Equal parts <em>mischief</em> and meaning.</h2><p>Pick a few moments. We turn them into a surprise they tap, play and feel.</p></header>
        <div className="rb-moment-grid">{moments.map((moment, index) => <article key={moment.title}><small>0{index + 1}</small><i>{moment.icon}</i><h3>{moment.title}</h3><p>{moment.text}</p></article>)}</div>
      </section>

      <section className="rb-ritual" id="how">
        <div className="rb-ritual-art">
          <div className="rb-thali"><i className="rb-diya">✦</i><span /><span /><b>ॐ</b></div>
          <div className="rb-thread"><i /><b>♥</b><i /></div>
          <div className="rb-petal p1">✿</div><div className="rb-petal p2">✿</div><div className="rb-petal p3">✦</div>
        </div>
        <div className="rb-ritual-copy"><span className="rb-kicker">THE DIGITAL SHAGUN</span><h2>The ritual stays.<br />The surprise gets an upgrade.</h2><ol><li><b>1</b><span><strong>Choose their vibe</strong><small>Sweet, silly, nostalgic—or all three.</small></span></li><li><b>2</b><span><strong>Add your shared world</strong><small>Letters, photos, voice notes, puzzles and games.</small></span></li><li><b>3</b><span><strong>Send one beautiful link</strong><small>Schedule it for the morning or rescue a last-minute gift.</small></span></li></ol><Link className="rb-primary" href="/">Start creating <span>→</span></Link></div>
      </section>

      <section className="rb-templates">
        <header><span className="rb-kicker">START WITH A FEELING</span><h2>Which sibling story is yours?</h2></header>
        <div className="rb-template-grid">{templates.map(template => <article key={template.title}><div><span>{template.emoji}</span><small>{template.tone}</small></div><p>{template.label}</p><h3>{template.title}</h3><Link href="/">Use this idea <span>→</span></Link></article>)}</div>
      </section>

      <section className="rb-final">
        <div className="rb-final-rakhi" aria-hidden="true"><i /><b>♥</b><i /></div>
        <span className="rb-kicker">NO COURIER. NO PANIC.</span>
        <h2>Made with memories.<br />Delivered in a moment.</h2>
        <p>Perfect for the sibling next door—or in another time zone.</p>
        <Link className="rb-primary" href="/">Create a sibling surprise <span>→</span></Link>
        <img src="/celebrations/rakhi-animal-stickers.png" alt="" aria-hidden="true" />
      </section>

      <footer className="rb-footer"><Link className="rb-brand" href="/"><span>♥</span>mypookie.</Link><p>Little worlds made for people you love.</p><small>© 2026 mypookie.</small></footer>
    </main>
  );
}

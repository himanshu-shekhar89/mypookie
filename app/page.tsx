"use client";

import { useMemo, useState } from "react";
import { LandingShowcase } from "./LandingShowcase";

type Block = {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: number;
  color: string;
  message: string;
};

const activities: Block[] = [
  { id: "letter", icon: "✉", name: "Personal letter", description: "A message they tap to unfold", price: 29, color: "coral", message: "You make ordinary days feel like celebrations." },
  { id: "voice", icon: "◖", name: "Voice message", description: "Record something only you can say", price: 39, color: "violet", message: "A little message from my heart to yours." },
  { id: "flowers", icon: "✿", name: "E-flowers", description: "A bouquet that blooms on screen", price: 29, color: "pink", message: "These flowers will never fade." },
  { id: "quiz", icon: "?", name: "Playful quiz", description: "Normal or floating wrong answers", price: 49, color: "blue", message: "How well do you know us?" },
  { id: "wheel", icon: "◎", name: "Spin the wheel", description: "Custom prizes and limited spins", price: 49, color: "amber", message: "Let chance choose your surprise." },
  { id: "puzzle", icon: "▦", name: "Photo puzzle", description: "Turn a memory into a 3×3 or 4×4", price: 59, color: "mint", message: "Put this favourite memory back together." },
  { id: "memory", icon: "⌁", name: "Memory lane", description: "Photos, dates and little stories", price: 79, color: "rose", message: "Every chapter with you is my favourite." },
  { id: "scratch", icon: "◇", name: "Scratch reveal", description: "Hide a gift, photo or promise", price: 39, color: "gold", message: "Something lovely is hiding here." },
  { id: "treasure", icon: "⌖", name: "Treasure hunt", description: "Clues that lead to a final surprise", price: 79, color: "green", message: "Follow the clues. Your surprise is waiting." },
  { id: "calendar", icon: "▣", name: "Unlock calendar", description: "7, 14 or 30 days of moments", price: 99, color: "purple", message: "A little something, one day at a time." },
  { id: "gift", icon: "♢", name: "Gift card", description: "Wrap a real or custom voucher", price: 29, color: "red", message: "A little treat, chosen just for you." },
];

const bundles = [
  { id: "romantic", badge: "Most loved", name: "Romantic surprise", copy: "A slow, heartfelt story made for your person.", ids: ["letter", "voice", "memory", "quiz", "flowers", "gift"], price: 249, tone: "romantic" },
  { id: "birthday", badge: "Playful", name: "Birthday adventure", copy: "Games, surprises and one very happy ending.", ids: ["letter", "puzzle", "quiz", "wheel", "scratch", "gift"], price: 279, tone: "birthday" },
  { id: "friend", badge: "Good chaos", name: "Best friend forever", copy: "Shared lore, silly questions and real appreciation.", ids: ["voice", "memory", "quiz", "puzzle", "gift"], price: 219, tone: "friend" },
];

const recipients = ["Lover", "Friend", "Parents", "Sibling", "Other"];

export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "catalog" | "builder" | "preview">("welcome");
  const [recipient, setRecipient] = useState("Lover");
  const [name, setName] = useState("Ananya");
  const [occasion, setOccasion] = useState("Just because");
  const [selected, setSelected] = useState<Block[]>([]);
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState("Blush romance");
  const [ambience, setAmbience] = useState("Petals");
  const [previewStep, setPreviewStep] = useState(0);
  const [opened, setOpened] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const [giftId, setGiftId] = useState<string | null>(null);

  const subtotal = useMemo(() => selected.reduce((sum, item) => sum + item.price, 0), [selected]);
  const activeBlock = selected[active];

  function useBundle(ids: string[]) {
    setSelected(ids.map(id => activities.find(a => a.id === id)!).filter(Boolean));
    setActive(0);
    setScreen("builder");
  }

  function toggleActivity(item: Block) {
    setSelected(current => current.some(x => x.id === item.id) ? current.filter(x => x.id !== item.id) : [...current, { ...item }]);
  }

  function move(index: number, direction: number) {
    const next = index + direction;
    if (next < 0 || next >= selected.length) return;
    const copy = [...selected];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setSelected(copy);
    setActive(next);
  }

  function updateMessage(value: string) {
    setSelected(current => current.map((b, index) => index === active ? { ...b, message: value } : b));
  }

  function launchPreview() {
    setPreviewStep(0);
    setOpened(false);
    setScreen("preview");
  }

  async function saveDraft() {
    setSaveState("saving");
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const body = {
        title: `${occasion} for ${name}`,
        recipientName: name,
        recipientType: recipient,
        occasion,
        theme,
        ambience,
        blocksJson: JSON.stringify(selected),
        scheduledAt: null,
      };
      const response = await fetch(`${api}/api/gifts${giftId ? `/${giftId}` : ""}`, {
        method: giftId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "X-Demo-User": "local-creator" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Save failed");
      const gift = await response.json();
      setGiftId(gift.id);
      setSaveState("saved");
    } catch {
      setSaveState("offline");
    }
  }


  if (screen === "welcome") {
    return (
      <main className="welcome-page">
        <div className="landing-motion" aria-hidden="true"><i/><i/><i/><span>♡</span><span>✦</span><span>✿</span></div>
        <nav className="nav">
          <button className="brand" onClick={() => setScreen("welcome")}><span>m</span> mypookie.</button>
          <div className="nav-links"><a href="#how">How it works</a><a href="#ideas">Gift ideas</a><a href="#pricing">Pricing</a></div>
          <button className="signin">Continue with Google <span>→</span></button>
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <div className="pill"><i /> Made for the people you love</div>
            <h1>A gift they don’t just open. <em>They experience it.</em></h1>
            <p>Build a little world of messages, memories, games and surprises—personalized by you, opened by them.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setScreen("catalog")}>Create a gift <span>→</span></button>
              <button className="text-button" onClick={() => useBundle(bundles[0].ids)}><span className="play">▶</span> Preview an experience</button>
            </div>
            <div className="social-proof"><div className="faces"><b>😊</b><b>🥰</b><b>🤍</b><b>✨</b></div><span><strong>4,800+ moments</strong><br/>made unforgettable</span></div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="phone">
              <div className="phone-top"><span>9:41</span><i /></div>
              <div className="phone-scene">
                <div className="mini-petals">✿　·　✿</div>
                <small>A LITTLE SOMETHING FOR</small>
                <h3>Ananya</h3>
                <div className="envelope"><div className="letter">You make every day brighter ♡</div><div className="flap" /></div>
                <button>Open your surprise</button>
              </div>
            </div>
            <div className="float-card card-memory"><span>⌁</span><div><small>MEMORY LANE</small><strong>Our first adventure</strong></div></div>
            <div className="float-card card-quiz"><span>♡</span><div><small>PERFECT MATCH</small><strong>92% compatible</strong></div></div>
            <div className="float-card card-gift"><span>♢</span><div><small>ONE MORE THING</small><strong>A surprise awaits</strong></div></div>
          </div>
        </section>
        <section className="marquee" id="ideas"><span>Personal letters</span><i>✦</i><span>Memory lanes</span><i>✦</i><span>Playful quizzes</span><i>✦</i><span>Photo puzzles</span><i>✦</i><span>Little surprises</span></section>
        <LandingShowcase />
        <section className="how" id="how">
          <div className="section-kicker">HOW IT WORKS</div>
          <h2>Made by you. <em>Magic for them.</em></h2>
          <div className="steps">
            <article><b>01</b><span>♡</span><h3>Choose your person</h3><p>Tell us who you’re celebrating and why.</p></article>
            <article><b>02</b><span>▦</span><h3>Build their experience</h3><p>Start with a bundle or choose every activity yourself.</p></article>
            <article><b>03</b><span>✦</span><h3>Send a little magic</h3><p>Preview, schedule and share one beautiful private link.</p></article>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "catalog") {
    return (
      <main className="product-page">
        <header className="app-header"><button className="brand" onClick={() => setScreen("welcome")}><span>m</span> mypookie.</button><div className="progress"><i className="done"/><i/><i/><span>Start</span></div><button className="avatar">H</button></header>
        <section className="catalog-intro">
          <button className="back" onClick={() => setScreen("welcome")}>← Back</button>
          <div className="section-kicker">LET’S MAKE SOMETHING BEAUTIFUL</div>
          <h1>Who is this little world for?</h1>
          <p>We’ll personalize the ideas, wording and themes around your relationship.</p>
          <div className="recipient-row">{recipients.map(r => <button key={r} className={recipient === r ? "active" : ""} onClick={() => setRecipient(r)}><span>{r === "Lover" ? "♡" : r === "Friend" ? "☺" : r === "Parents" ? "⌂" : r === "Sibling" ? "✦" : "+"}</span>{r}</button>)}</div>
          <div className="quick-fields"><label>Their name<input value={name} onChange={e => setName(e.target.value)} /></label><label>Occasion<select value={occasion} onChange={e => setOccasion(e.target.value)}><option>Just because</option><option>Birthday</option><option>Anniversary</option><option>I’m sorry</option><option>Congratulations</option></select></label></div>
        </section>
        <section className="creation-choice">
          <div className="choice-heading"><div><div className="section-kicker">CHOOSE YOUR WAY</div><h2>Start with a story or make your own</h2></div><button className="scratch-link" onClick={() => {setSelected([]);setScreen("builder")}}>Build from scratch <span>→</span></button></div>
          <div className="bundle-grid">{bundles.map((b, index) => <article className={`bundle bundle-${index}`} key={b.id}><div className="bundle-art"><span>{index === 0 ? "♡" : index === 1 ? "✦" : "☺"}</span><div className="bundle-pages"><i/><i/><i/></div></div><div className="bundle-content"><small>{b.badge}</small><h3>{b.name}</h3><p>{b.copy}</p><div className="bundle-includes">{b.ids.slice(0,4).map(id => <span key={id}>{activities.find(a => a.id === id)?.icon}</span>)}<b>+{b.ids.length-4}</b></div><div className="bundle-bottom"><strong>₹{b.price}</strong><button onClick={() => useBundle(b.ids)}>Choose bundle →</button></div><em>Everything can be changed</em></div></article>)}</div>
        </section>
      </main>
    );
  }

  if (screen === "preview") {
    const item = selected[previewStep];
    return (
      <main className={`recipient-preview theme-${theme.toLowerCase().replaceAll(" ","-")}`}>
        {ambience === "Petals" && <div className="falling"><i>✿</i><i>·</i><i>✿</i><i>·</i><i>✿</i></div>}
        <button className="exit-preview" onClick={() => setScreen("builder")}>← Back to builder</button>
        <div className="recipient-card">
          <div className="preview-count">{previewStep + 1} of {selected.length}</div>
          {!item ? <><div className="big-symbol">♡</div><h1>Your gift needs a little magic</h1><p>Add an activity in the builder to begin.</p></> : <>
            <div className={`activity-symbol ${item.color}`}>{item.icon}</div>
            <div className="section-kicker">A LITTLE SOMETHING FOR {name.toUpperCase()}</div>
            <h1>{item.name}</h1>
            <p>{item.message}</p>
            {item.id === "quiz" && opened && <div className="preview-answers"><button>Our first date</button><button className="dodge">I forgot</button></div>}
            {item.id === "puzzle" && opened && <div className="puzzle-grid">{Array.from({length:9}).map((_,i)=><i key={i}>{i+1}</i>)}</div>}
            {item.id === "flowers" && opened && <div className="bouquet">🌷<span>🌸</span>🌷</div>}
            {!opened ? <button className="primary preview-action" onClick={() => setOpened(true)}>{item.id === "letter" ? "Open your letter" : item.id === "wheel" ? "Spin the wheel" : item.id === "scratch" ? "Scratch to reveal" : item.id === "flowers" ? "Let them bloom" : item.id === "puzzle" ? "Start puzzle" : "Begin this moment"} <span>→</span></button> :
            <button className="primary preview-action" onClick={() => { if (previewStep < selected.length-1) {setPreviewStep(previewStep+1);setOpened(false)} else {setPreviewStep(0);setOpened(false)} }}>{previewStep < selected.length-1 ? "Show me what’s next" : "Experience it again"} <span>→</span></button>}
          </>}
        </div>
      </main>
    );
  }

  return (
    <main className="builder-page">
      <header className="app-header builder-header"><button className="brand" onClick={() => setScreen("welcome")}><span>m</span> mypookie.</button><div className="gift-title"><small>CREATING FOR</small><strong>{name || "Someone special"} <i>♡</i></strong></div><div className="header-actions"><button className="quiet" onClick={saveDraft}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "offline" ? "Backend offline · Retry" : "Save draft"}</button><button className="preview-button" onClick={launchPreview}>Preview gift <span>▶</span></button></div></header>
      <div className="builder-shell">
        <aside className="library">
          <div className="library-head"><div><div className="section-kicker">ACTIVITY LIBRARY</div><h2>Add a little magic</h2></div><span>{activities.length}</span></div>
          <p>Tap an activity to add it. Every detail can be changed.</p>
          <div className="activity-list">{activities.map(item => {const isSelected=selected.some(x=>x.id===item.id);return <button className={isSelected?"selected":""} key={item.id} onClick={()=>toggleActivity(item)}><i className={item.color}>{item.icon}</i><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{isSelected?"✓":`₹${item.price}`}</b></button>})}</div>
        </aside>
        <section className="sequence">
          <div className="sequence-head"><div><div className="section-kicker">YOUR EXPERIENCE</div><h2>Arrange their journey</h2></div><span>{selected.length} moments</span></div>
          <p>Use the handles or arrows to set the order they’ll experience everything.</p>
          {selected.length === 0 ? <div className="empty-sequence"><span>✦</span><h3>Your story starts here</h3><p>Choose activities from the library, or return to pick a ready-made bundle.</p><button onClick={()=>setScreen("catalog")}>Explore bundles</button></div> :
          <div className="sequence-list">{selected.map((item,index)=><article key={item.id} className={active===index?"active":""} onClick={()=>setActive(index)}><button className="drag" aria-label="Drag activity">⠿</button><i className={item.color}>{item.icon}</i><div><small>MOMENT {index+1}</small><strong>{item.name}</strong><span>{item.message}</span></div><div className="order-buttons"><button onClick={e=>{e.stopPropagation();move(index,-1)}} disabled={index===0}>↑</button><button onClick={e=>{e.stopPropagation();move(index,1)}} disabled={index===selected.length-1}>↓</button></div></article>)}</div>}
          <button className="add-moment" onClick={()=>document.querySelector(".library")?.scrollIntoView({behavior:"smooth"})}>＋ Add another moment</button>
        </section>
        <aside className="customizer">
          <div className="customizer-head"><div className="section-kicker">CUSTOMIZE</div><span>{selected.length ? `${active+1} / ${selected.length}` : "0 / 0"}</span></div>
          {!activeBlock ? <div className="custom-empty"><span>✎</span><h3>Select an activity</h3><p>Choose a moment to personalize its words, behaviour and style.</p></div> : <>
            <div className="current-block"><i className={activeBlock.color}>{activeBlock.icon}</i><div><small>MOMENT {active+1}</small><h2>{activeBlock.name}</h2></div></div>
            <label className="field">Welcome message<textarea rows={4} value={activeBlock.message} onChange={e=>updateMessage(e.target.value)} /><small>{activeBlock.message.length}/180</small></label>
            {activeBlock.id === "quiz" && <><label className="field">Question<input defaultValue="Where did we first meet?" /></label><label className="field">Interaction<select defaultValue="floating"><option value="floating">Wrong answer floats away</option><option value="normal">Normal answers + score</option></select></label></>}
            {activeBlock.id === "puzzle" && <><label className="upload">▧<strong>Choose a photo</strong><span>Upload from your gallery</span><input type="file" accept="image/*" /></label><label className="field">Difficulty<select><option>3 × 3 · Sweet and simple</option><option>4 × 4 · A little challenge</option><option>5 × 5 · Puzzle lover</option></select></label></>}
            {activeBlock.id === "voice" && <button className="record">● Start recording <span>or upload audio</span></button>}
            {activeBlock.id === "wheel" && <label className="field">Prize list<textarea rows={4} defaultValue={"Breakfast in bed\nMovie night\nMystery date"} /></label>}
            {activeBlock.id === "flowers" && <label className="field">Flower style<select><option>Blush tulips</option><option>Wildflower garden</option><option>Classic red roses</option></select></label>}
            <div className="style-row"><label className="field">Theme<select value={theme} onChange={e=>setTheme(e.target.value)}><option>Blush romance</option><option>Golden celebration</option><option>Midnight magic</option></select></label><label className="field">Ambience<select value={ambience} onChange={e=>setAmbience(e.target.value)}><option>Petals</option><option>Soft sparkles</option><option>None</option></select></label></div>
            <button className="block-preview" onClick={launchPreview}>▶ Preview this moment</button>
            <div className="next-row"><button disabled={active===0} onClick={()=>setActive(active-1)}>←</button><button onClick={()=>setActive(Math.min(active+1,selected.length-1))}>{active===selected.length-1?"Finish customization":"Save & customize next"} <span>→</span></button></div>
          </>}
        </aside>
      </div>
      <footer className="checkout-bar"><div><small>YOUR GIFT</small><strong>{selected.length} moments for {name}</strong></div><div className="price"><span>Live total</span><strong>₹{subtotal}</strong></div><button disabled={!selected.length} onClick={launchPreview}>Review & continue <span>→</span></button></footer>
    </main>
  );
}

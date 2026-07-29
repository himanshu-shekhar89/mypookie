"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LandingShowcase } from "./LandingShowcase";
import { BuilderLivePreview } from "./BuilderLivePreview";
import { BlockCustomization } from "./BlockCustomization";

type Block = {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: number;
  color: string;
  message: string;
  config?: Record<string, string>;
};

type WonItem = { id: number; source: string; reward: string };

const activities: Block[] = [
  { id: "letter", icon: "✉", name: "Personal letter", description: "A message they tap to unfold", price: 29, color: "coral", message: "You make ordinary days feel like celebrations." },
  { id: "voice", icon: "◖", name: "Voice message", description: "Record something only you can say", price: 39, color: "violet", message: "A little message from my heart to yours." },
  { id: "flowers", icon: "✦", name: "E-gifts", description: "Full-screen flowers, fireworks and celebrations", price: 29, color: "pink", message: "A beautiful celebration, just for you." },
  { id: "quiz", icon: "?", name: "Playful quiz", description: "Normal or floating wrong answers", price: 49, color: "blue", message: "How well do you know us?" },
  { id: "wheel", icon: "◎", name: "Spin the wheel", description: "Custom prizes and limited spins", price: 49, color: "amber", message: "Let chance choose your surprise." },
  { id: "slots", icon: "♛", name: "Slot machine", description: "Pull the lever to reveal a prize", price: 49, color: "red", message: "Pull the lever and let the reels decide." },
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

const blockDefaults: Record<string, Record<string, string>> = {
  letter: { signoff: "— sent with love", animation: "Lift and unfold" },
  voice: { audioName: "", playbackStyle: "Classic waveform" },
  flowers: { effect: "Flower shower", timing: "Entire show", intensity: "Lush", effectNote: "A beautiful celebration, just for you." },
  quiz: { quizQuestions: JSON.stringify([{ id: "q1", question: "Where did we first meet?", options: [{ text: "At our favourite café", image: "" }, { text: "At a party", image: "" }, { text: "Online", image: "" }, { text: "I forgot", image: "" }], correctIndex: 0, interaction: "floating" }]) },
  wheel: { prizes: "Breakfast in bed\nMovie night\nMystery date\nA long hug\nSweet treat", spins: "1", resultMode: "Random", plannedResults: "Breakfast in bed", revealAnimation: "Confetti burst" },
  slots: { prizes: "Movie night\nBreakfast date\nA long hug\nSweet treat", pulls: "3", resultMode: "Random", plannedResults: "", revealAnimation: "Sparkle shower" },
  puzzle: { imageUrl: "/mypookie-puzzle-picnic.png", imageName: "", difficulty: "3 × 3 · Sweet and simple", successMessage: "You put this memory back together." },
  memory: { memoryItems: "[]", coverImage: "/mypookie-letter-photo.png", coverCaption: "Our little book of us" },
  scratch: { revealText: "A candlelit dinner ♡", revealDetail: "Friday · 8:00 PM", coating: "Lilac shimmer" },
  treasure: { treasureClues: JSON.stringify([{ clue: "Start where we first said hello.", hint: "Think about our first conversation.", answer: "cafe", photo: "", caption: "" }, { clue: "Find the place in our favourite photo.", hint: "It was outdoors.", answer: "picnic", photo: "", caption: "" }]), finalSurprise: "A mystery date for us" },
  calendar: { days: "7", unlockRule: "One per day", startDate: "", calendarNotes: JSON.stringify(["A reason I adore you","A favourite memory","A tiny promise","A photo that makes me smile","Your song of the day","A little challenge","Your final surprise"]) },
  gift: { brand: "Custom gift", code: "POOKIE-LOVE-24", value: "₹1,000", giftMessage: "Choose something that makes you smile.", interaction: "Flip to reveal", showCode: "true", showValue: "true", showNote: "true" },
};

function createBlock(item: Block): Block {
  return { ...item, config: { ...(blockDefaults[item.id] || {}) } };
}

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
  const [heroStage, setHeroStage] = useState<"closed" | "open" | "flipped">("closed");
  const [currentTime, setCurrentTime] = useState("");
  const [occasionFx, setOccasionFx] = useState<string | null>(null);
  const [soundtrack, setSoundtrack] = useState({ enabled: false, audioUrl: "", name: "", startMode: "From the beginning", startBlockId: "", startSeconds: "0" });
  const [completedSteps,setCompletedSteps]=useState<number[]>([]);
  const [wonItems,setWonItems]=useState<WonItem[]>([]);
  const [winsOpen,setWinsOpen]=useState(false);
  const rewardCounter=useRef(0);

  const subtotal = useMemo(() => selected.reduce((sum, item) => sum + item.price, 0), [selected]);
  const activeBlock = selected[active];

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  function chooseBundle(ids: string[]) {
    setSelected(ids.map(id => activities.find(a => a.id === id)).filter(Boolean).map(item => createBlock(item!)));
    setActive(0);
    setScreen("builder");
  }

  function selectActivity(item: Block) {
    const existingIndex = selected.findIndex(x => x.id === item.id);
    if (existingIndex >= 0) {
      setActive(existingIndex);
      return;
    }
    setSelected(current => [...current, createBlock(item)]);
    setActive(selected.length);
  }

  function setActivitySelected(item: Block, checked: boolean) {
    const existingIndex = selected.findIndex(block => block.id === item.id);
    if (checked) {
      if (existingIndex >= 0) {
        setActive(existingIndex);
        return;
      }
      setSelected(current => [...current, createBlock(item)]);
      setActive(selected.length);
      return;
    }
    if (existingIndex < 0) return;
    setSelected(current => current.filter(block => block.id !== item.id));
    setActive(current => {
      if (existingIndex < current) return current - 1;
      if (existingIndex === current) return Math.max(0, Math.min(current, selected.length - 2));
      return current;
    });
  }

  function removeActiveBlock() {
    if (!activeBlock) return;
    setSelected(current => current.filter((_, index) => index !== active));
    setActive(current => Math.max(0, Math.min(current, selected.length - 2)));
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

  function updateBlockConfig(key: string, value: string) {
    setSelected(current => current.map((block, index) => index === active ? { ...block, config: { ...(block.config || {}), [key]: value } } : block));
  }

  function launchPreview() {
    setPreviewStep(0);
    setOpened(false);
    setCompletedSteps([]);
    setWonItems([]);
    setWinsOpen(false);
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
        blocksJson: JSON.stringify({ version: 2, blocks: selected, soundtrack }),
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

  function celebrateOccasion(type: string) {
    setOccasionFx(null);
    window.requestAnimationFrame(() => setOccasionFx(type));
    window.setTimeout(() => setOccasionFx(null), 3200);
  }


  if (screen === "welcome") {
    return (
      <main className="welcome-page">
        <div className="landing-motion" aria-hidden="true"><i/><i/><i/><span>♡</span><span>✦</span><span>✿</span></div>
        {occasionFx && <div className={`occasion-fx fx-${occasionFx}`} aria-live="polite"><div className="fx-icons">{occasionFx === "birthday" ? <><i>🎈</i><i>🎂</i><i>🎉</i><i>🎈</i><i>✨</i></> : occasionFx === "anniversary" ? <><i>♡</i><i>💐</i><i>💍</i><i>♡</i><i>✨</i></> : occasionFx === "friendship" ? <><i>🎊</i><i>📸</i><i>🥳</i><i>🎊</i><i>⭐</i></> : <><i>🌸</i><i>💌</i><i>✨</i><i>🌷</i><i>♡</i></>}</div><strong>{occasionFx === "birthday" ? "Make their birthday pop!" : occasionFx === "anniversary" ? "Celebrate every chapter." : occasionFx === "friendship" ? "For your favourite chaos." : "Because ordinary days deserve magic."}</strong></div>}
        <nav className="nav">
          <button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button>
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
              <button className="text-button" onClick={() => chooseBundle(bundles[0].ids)}><span className="play">▶</span> Preview an experience</button>
            </div>
            <div className="social-proof"><div className="faces"><b>😊</b><b>🥰</b><b>🤍</b><b>✨</b></div><span><strong>4,800+ moments</strong><br/>made unforgettable</span></div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className={`phone phone-stage-${heroStage}`}>
              <div className="phone-top"><span>{currentTime}</span><i /><b>●　⌁</b></div>
              <div className="phone-scene">
                <div className="mini-petals">✿　·　✿</div>
                <small>A LITTLE SOMETHING FOR</small>
                <h3>Ananya</h3>
                <div className="phone-envelope" role="button" tabIndex={0} onClick={() => heroStage === "closed" && setHeroStage("open")} onKeyDown={event => { if ((event.key === "Enter" || event.key === " ") && heroStage === "closed") setHeroStage("open"); }}>
                  <div className="phone-card-wrap">
                    <button className="phone-letter-card" onClick={event => { event.stopPropagation(); if (heroStage === "open") setHeroStage("flipped"); else if (heroStage === "flipped") setHeroStage("open"); }} aria-label={heroStage === "flipped" ? "Show letter message" : "Flip letter to reveal photo"}>
                      <span className="phone-letter-front">You make every day<br/>brighter ♡<small>tap the letter</small></span>
                      <span className="phone-letter-back"><img src="/mypookie-letter-photo.png" alt="A happy memory at the fair" /><small>one of my favourite memories</small></span>
                    </button>
                  </div>
                  <div className="phone-envelope-back" />
                  <div className="phone-envelope-front" />
                  <div className="phone-envelope-flap" />
                  <b className="phone-wax">♥</b>
                </div>
                <button className="phone-open-action" onClick={() => setHeroStage(heroStage === "closed" ? "open" : "closed")}>{heroStage === "closed" ? "Open your surprise" : "Close surprise"}</button>
              </div>
            </div>
            <div className="float-card card-memory"><span>⌁</span><div><small>MEMORY LANE</small><strong>Our first adventure</strong></div></div>
            <div className="float-card card-quiz"><span>♡</span><div><small>PERFECT MATCH</small><strong>92% compatible</strong></div></div>
            <div className="float-card card-gift"><span>♢</span><div><small>ONE MORE THING</small><strong>A surprise awaits</strong></div></div>
          </div>
        </section>
        <section className="occasion-strip" aria-label="Preview gifts by occasion">
          <div><small>SEE THE MAGIC FOR</small><strong>What are you celebrating?</strong></div>
          {[
            ["birthday","Birthday"],
            ["anniversary","Anniversary"],
            ["friendship","Friendship"],
            ["just-because","Just because"],
          ].map(([id,label], index) => <button key={id} onClick={() => celebrateOccasion(id)}><i style={{backgroundImage:"url('/mypookie-occasions.png')",backgroundPosition:`${index * 33.333}% center`}}/><span>{label}</span><b>Try it →</b></button>)}
        </section>
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
        <header className="app-header"><button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button><div className="progress"><i className="done"/><i/><i/><span>Start</span></div><button className="avatar">H</button></header>
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
          <div className="bundle-grid">{bundles.map((b, index) => <article className={`bundle bundle-${index}`} key={b.id}><div className="bundle-art"><span>{index === 0 ? "♡" : index === 1 ? "✦" : "☺"}</span><div className="bundle-pages"><i/><i/><i/></div></div><div className="bundle-content"><small>{b.badge}</small><h3>{b.name}</h3><p>{b.copy}</p><div className="bundle-includes">{b.ids.slice(0,4).map(id => <span key={id}>{activities.find(a => a.id === id)?.icon}</span>)}<b>+{b.ids.length-4}</b></div><div className="bundle-bottom"><strong>₹{b.price}</strong><button onClick={() => chooseBundle(b.ids)}>Choose bundle →</button></div><em>Everything can be changed</em></div></article>)}</div>
        </section>
      </main>
    );
  }

  if (screen === "preview") {
    const item = selected[previewStep];
    const effectBlock = selected.find(block => block.id === "flowers");
    const effectConfig = effectBlock?.config || {};
    const effectSymbols: Record<string,string[]> = {"Flower shower":["🌸","🌷","🌼"],"Fireworks":["🎆","✨","🎇"],"Birthday party":["🎈","🎂","🎉"],"Christmas magic":["🎄","❄️","🎁"],"Hearts":["💗","💕","💖"],"Snowfall":["❄️","❅","✦"]};
    const showEffect = Boolean(effectBlock) && (effectConfig.timing === "Entire show" || (effectConfig.timing === "Only on this block" && item?.id === "flowers") || (effectConfig.timing === "After winning or interacting" && opened) || (effectConfig.timing === "At the end" && previewStep === selected.length-1));
    const currentComplete=completedSteps.includes(previewStep);
    function completeMoment(){setCompletedSteps(current=>current.includes(previewStep)?current:[...current,previewStep])}
    function addReward(reward:string){
      rewardCounter.current+=1;
      setWonItems(current=>[...current,{id:rewardCounter.current,source:item?.name||"A surprise",reward}]);
      setWinsOpen(true);
    }
    return (
      <main className={`recipient-preview theme-${theme.toLowerCase().replaceAll(" ","-")}`}>
        {showEffect && <div className={`recipient-effect-overlay effect-${(effectConfig.intensity||"Lush").toLowerCase()}`} aria-hidden="true">{Array.from({length:28},(_,index)=><i key={index} style={{left:`${(index*37)%100}%`,animationDelay:`${(index%9)*-.32}s`}}>{(effectSymbols[effectConfig.effect]||effectSymbols["Flower shower"])[index%3]}</i>)}</div>}
        <button className="exit-preview" onClick={() => setScreen("builder")}>← Back to builder</button>
        <GiftSoundtrack settings={soundtrack} blocks={selected} step={previewStep} />
        <WinningTray items={wonItems} open={winsOpen} onToggle={()=>setWinsOpen(value=>!value)} />
        <div className="recipient-experience-shell">
          <div className="preview-count">{previewStep + 1} of {selected.length}</div>
          {!item ? <div className="preview-empty"><div className="big-symbol">♡</div><h1>Your gift needs a little magic</h1><p>Add an activity in the builder to begin.</p></div> : <BuilderLivePreview key={`${item.id}-${previewStep}`} block={item} name={name} theme={theme} ambience={ambience} onInteract={()=>setOpened(true)} onComplete={completeMoment} onReward={addReward} />}
          {item && <div className="recipient-progress-gate"><button className="primary recipient-next" disabled={!currentComplete} onClick={() => { if (previewStep < selected.length-1) {setPreviewStep(previewStep+1);setOpened(false)} else {setPreviewStep(0);setOpened(false);setCompletedSteps([]);setWonItems([])} }}>{previewStep < selected.length-1 ? "Continue to the next moment" : "Experience it again"} <span>→</span></button>{!currentComplete&&<small>Complete this moment to unlock the next one</small>}{currentComplete&&<small className="ready">Moment complete ✓</small>}</div>}
        </div>
      </main>
    );
  }

  return (
    <main className="builder-page">
      <header className="app-header builder-header"><div className="builder-brand-row"><button className="editor-back" onClick={() => setScreen("catalog")} aria-label="Go back to gift choices">← <span>Back</span></button><button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button></div><div className="gift-title"><small>CREATING FOR</small><strong>{name || "Someone special"} <i>♡</i></strong></div><div className="header-actions"><button className="quiet" onClick={saveDraft}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "offline" ? "Backend offline · Retry" : "Save draft"}</button><button className="preview-button" onClick={launchPreview}>Preview gift <span>▶</span></button></div></header>
      <div className="builder-shell">
        <aside className="library">
          <div className="library-head"><div><div className="section-kicker">ACTIVITY LIBRARY</div><h2>Add a little magic</h2></div><span>{activities.length}</span></div>
          <p>Choose a block to add it and try it live in the centre.</p>
          <div className="activity-list">{activities.map(item => {const selectedIndex=selected.findIndex(x=>x.id===item.id);const isSelected=selectedIndex>=0;const isActive=isSelected&&active===selectedIndex;return <label className={`activity-choice ${isSelected?"selected":""} ${isActive?"active":""}`} key={item.id}>
            <input type="checkbox" checked={isSelected} onChange={event=>setActivitySelected(item,event.target.checked)} aria-label={`${isSelected?"Remove":"Add"} ${item.name}`} />
            <span className="activity-check" aria-hidden="true">{isSelected?"✓":""}</span>
            <i className={item.color}>{item.icon}</i>
            <span className="activity-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
            <b>{isActive?"LIVE":isSelected?"SELECTED":`₹${item.price}`}</b>
          </label>})}</div>
        </aside>
        <section className="live-editor">
          <div className="live-editor-head"><div><div className="section-kicker">LIVE RECIPIENT PREVIEW</div><h2>{activeBlock ? activeBlock.name : "Choose a block to begin"}</h2><p>{activeBlock ? "Play with it here. Changes from the right appear instantly." : "Select any activity from the library and its real interaction will appear here."}</p></div>{activeBlock && <span className="live-badge"><i /> Interactive</span>}</div>
          {activeBlock ? <BuilderLivePreview key={activeBlock.id} block={activeBlock} name={name} theme={theme} ambience={ambience} /> : <div className="empty-live-preview"><div className="empty-live-orbit"><span>✦</span><i>♡</i><b>✿</b></div><h3>Your live preview will appear here</h3><p>Try the letter, wheel, puzzle, quiz and every other block before sending it.</p><button onClick={() => selectActivity(activities[0])}>Start with a personal letter →</button></div>}
          {selected.length > 0 && <div className="journey-rail"><div className="journey-rail-head"><div><small>GIFT SEQUENCE</small><strong>{selected.length} moments for {name}</strong></div><span>Tap a block to edit it</span></div><div className="journey-chips">{selected.map((item,index)=><div className={`journey-chip ${active===index?"active":""}`} key={item.id}><button className="journey-select" onClick={()=>setActive(index)}><i className={item.color}>{item.icon}</i><span><small>{index+1}</small>{item.name}</span></button><div><button onClick={()=>move(index,-1)} disabled={index===0} aria-label={`Move ${item.name} earlier`}>←</button><button onClick={()=>move(index,1)} disabled={index===selected.length-1} aria-label={`Move ${item.name} later`}>→</button></div></div>)}</div></div>}
        </section>
        <aside className="customizer">
          <div className="customizer-head"><div className="section-kicker">CUSTOMIZE</div><span>{selected.length ? `${active+1} / ${selected.length}` : "0 / 0"}</span></div>
          {!activeBlock ? <div className="custom-empty"><span>✎</span><h3>Select an activity</h3><p>Choose a moment to personalize its words, behaviour and style.</p></div> : <>
            <div className="current-block"><i className={activeBlock.color}>{activeBlock.icon}</i><div><small>MOMENT {active+1}</small><h2>{activeBlock.name}</h2></div></div>
            <BlockCustomization key={activeBlock.id} block={activeBlock} onMessage={updateMessage} onConfig={updateBlockConfig} />
            <SoundtrackEditor settings={soundtrack} blocks={selected} onChange={patch=>setSoundtrack(current=>({...current,...patch}))} />
            <div className="style-row"><label className="field">Theme<select value={theme} onChange={e=>setTheme(e.target.value)}><option>Blush romance</option><option>Golden celebration</option><option>Midnight magic</option></select></label><label className="field">Ambience<select value={ambience} onChange={e=>setAmbience(e.target.value)}><option>Petals</option><option>Soft sparkles</option><option>None</option></select></label></div>
            <div className="customizer-live-note"><i /> You’re editing the live preview</div>
            <div className="next-row"><button disabled={active===0} onClick={()=>setActive(active-1)}>←</button><button onClick={()=>setActive(Math.min(active+1,selected.length-1))}>{active===selected.length-1?"Finish customization":"Save & customize next"} <span>→</span></button></div>
            <button className="remove-block" onClick={removeActiveBlock}>Remove this block</button>
          </>}
        </aside>
      </div>
      <footer className="checkout-bar"><div><small>YOUR GIFT</small><strong>{selected.length} moments for {name}</strong></div><div className="price"><span>Live total</span><strong>₹{subtotal}</strong></div><button disabled={!selected.length} onClick={launchPreview}>Review & continue <span>→</span></button></footer>
    </main>
  );
}

type SoundtrackSettings = {
  enabled: boolean;
  audioUrl: string;
  name: string;
  startMode: string;
  startBlockId: string;
  startSeconds: string;
};

function SoundtrackEditor({settings,blocks,onChange}:{settings:SoundtrackSettings;blocks:Block[];onChange:(patch:Partial<SoundtrackSettings>)=>void}){
  const [uploadError,setUploadError]=useState("");
  function upload(files:FileList|null){
    const file=files?.[0];
    if(!file)return;
    if(file.size>15*1024*1024){setUploadError("Please choose a song under 15 MB.");return}
    const reader=new FileReader();
    reader.onload=()=>{onChange({audioUrl:String(reader.result),name:file.name,enabled:true});setUploadError("")};
    reader.readAsDataURL(file);
  }
  const startBlock=settings.startBlockId&&blocks.some(block=>block.id===settings.startBlockId)?settings.startBlockId:(blocks[0]?.id||"");
  return <details className="soundtrack-editor">
    <summary><span>♫</span><div><strong>Gift soundtrack</strong><small>{settings.enabled&&settings.audioUrl?settings.name:"Optional background music"}</small></div><b>{settings.enabled?"ON":"OFF"}</b></summary>
    <div className="soundtrack-body">
      <label className="soundtrack-toggle"><input type="checkbox" checked={settings.enabled} onChange={event=>onChange({enabled:event.target.checked})}/><span/><div><strong>Play background music</strong><small>The recipient can always pause or mute it.</small></div></label>
      <label className="audio-template-upload">♪<strong>{settings.name||"Upload a song template"}</strong><span>MP3, M4A, WAV or OGG · up to 15 MB</span><input type="file" accept="audio/*" onChange={event=>upload(event.target.files)}/></label>
      {uploadError&&<p className="soundtrack-error">{uploadError}</p>}
      <p className="template-note">Your curated song templates will appear here when you provide them.</p>
      <label className="field">When should it begin?<select value={settings.startMode} onChange={event=>onChange({startMode:event.target.value})}><option>From the beginning</option><option>From a specific block</option></select></label>
      {settings.startMode==="From a specific block"&&<label className="field">Start at block<select value={startBlock} onChange={event=>onChange({startBlockId:event.target.value})}>{blocks.map((block,index)=><option value={block.id} key={block.id}>{index+1}. {block.name}</option>)}</select></label>}
      <label className="field">Start song at<input type="number" min="0" max="600" value={settings.startSeconds} onChange={event=>onChange({startSeconds:event.target.value})}/><small>seconds</small></label>
    </div>
  </details>;
}

function GiftSoundtrack({settings,blocks,step}:{settings:SoundtrackSettings;blocks:Block[];step:number}){
  const audioRef=useRef<HTMLAudioElement>(null);
  const initialized=useRef(false);
  const [playing,setPlaying]=useState(false);
  const startIndex=settings.startMode==="From a specific block"?Math.max(0,blocks.findIndex(block=>block.id===(settings.startBlockId||blocks[0]?.id))):0;
  const ready=step>=startIndex;

  useEffect(()=>{
    const audio=audioRef.current;
    if(!audio)return;
    if(!settings.enabled||!playing||!ready){audio.pause();return}
    if(!initialized.current){
      const seek=Math.max(0,Number(settings.startSeconds)||0);
      if(Number.isFinite(audio.duration))audio.currentTime=Math.min(seek,Math.max(audio.duration-.25,0));
      else audio.currentTime=seek;
      initialized.current=true;
    }
    void audio.play().catch(()=>{});
  },[playing,ready,settings.enabled,settings.startSeconds]);

  useEffect(()=>{initialized.current=false},[settings.audioUrl,settings.startBlockId,settings.startMode]);

  if(!settings.enabled)return null;
  const target=blocks[startIndex]?.name||"the first block";
  return <div className={`recipient-soundtrack ${playing?"playing":""}`}>
    <button disabled={!settings.audioUrl} onClick={()=>setPlaying(value=>!value)} aria-label={playing?"Pause soundtrack":"Play soundtrack"}>{playing?"Ⅱ":"♫"}</button>
    <div><strong>{settings.audioUrl?(settings.name||"Your soundtrack"):"Add a song in the builder"}</strong><small>{!settings.audioUrl?"No audio selected":playing&&!ready?`Queued for ${target}`:playing?"Playing through your gift":settings.startMode==="From a specific block"?`Starts at ${target}`:"Tap to play"}</small></div>
    {settings.audioUrl&&<audio ref={audioRef} src={settings.audioUrl} loop preload="metadata"/>}
  </div>;
}

function WinningTray({items,open,onToggle}:{items:WonItem[];open:boolean;onToggle:()=>void}){
  return <aside className={`winning-tray ${open?"open":""}`}>
    <button onClick={onToggle} aria-expanded={open}><span>🏆</span><div><strong>Things you won</strong><small>{items.length?`${items.length} collected`:"Your prizes appear here"}</small></div><b>{items.length}</b></button>
    {open&&<div className="winning-list">{items.length===0?<p>Play the games to fill this little trophy case.</p>:items.map(item=><article key={item.id}><span>✦</span><div><small>{item.source}</small><strong>{item.reward}</strong></div></article>)}</div>}
  </aside>;
}

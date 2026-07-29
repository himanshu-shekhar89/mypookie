"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { LandingShowcase } from "./LandingShowcase";
import { BuilderLivePreview } from "./BuilderLivePreview";
import { BlockCustomization } from "./BlockCustomization";
import { GroupContributionPage } from "./GroupContributionPage";
import { CheckoutPage, type PaymentOrder, type RazorpayResult } from "./CheckoutPage";
import { PublicGiftExperience } from "./PublicGiftExperience";
import { AdminPanel } from "./AdminPanel";
import { authHeaders, signInWithFirebase, watchFirebaseAuth } from "./authClient";

type Block = {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: number;
  color: string;
  message: string;
  category: "Messages & media" | "Memories" | "Playful games" | "Sentimental stories" | "Celebrations & gifts" | "Plans & together";
  config?: Record<string, string>;
};

type WonItem = { id: number; source: string; reward: string };

const activities: Block[] = [
  { id: "letter", icon: "✉", name: "Personal letter", description: "A message they tap to unfold", price: 29, color: "coral", category: "Messages & media", message: "You make ordinary days feel like celebrations." },
  { id: "voice", icon: "◖", name: "Voice message", description: "Record something only you can say", price: 39, color: "violet", category: "Messages & media", message: "A little message from my heart to yours." },
  { id: "video", icon: "▶", name: "Video note", description: "Record or upload a retro-style video", price: 59, color: "rose", category: "Messages & media", message: "A little face-to-face moment, just for you." },
  { id: "memory", icon: "⌁", name: "Memory lane", description: "Photos, dates and little stories", price: 79, color: "rose", category: "Memories", message: "Every chapter with you is my favourite." },
  { id: "puzzle", icon: "▦", name: "Photo puzzle", description: "Turn a memory into a 3×3 or 4×4", price: 59, color: "mint", category: "Memories", message: "Put this favourite memory back together." },
  { id: "quiz", icon: "?", name: "Playful quiz", description: "Normal or floating wrong answers", price: 49, color: "blue", category: "Playful games", message: "How well do you know us?" },
  { id: "thisorthat", icon: "↔", name: "This or that", description: "Fast little choices about your story", price: 39, color: "violet", category: "Playful games", message: "No overthinking—choose your favourite." },
  { id: "emoji", icon: "☺", name: "Emoji decoder", description: "Guess the memory hidden in symbols", price: 39, color: "amber", category: "Playful games", message: "Can you decode this little memory?" },
  { id: "wouldrather", icon: "⇄", name: "Would You Rather", description: "Swipe through sender-written either/or cards", price: 39, color: "violet", category: "Playful games", message: "Choose quickly—your picks tell a story." },
  { id: "neverhave", icon: "✋", name: "Never Have I Ever", description: "A light, shareable confession deck", price: 39, color: "amber", category: "Playful games", message: "No judgement. Maybe a little teasing." },
  { id: "truthdare", icon: "◉", name: "Truth or Dare Roulette", description: "Spin into sender-written truths and dares", price: 49, color: "red", category: "Playful games", message: "Let the wheel choose what happens next." },
  { id: "tapheart", icon: "♥", name: "Tap the Hearts", description: "Ten seconds of fast, floating-heart taps", price: 39, color: "pink", category: "Playful games", message: "How many hearts can you catch in ten seconds?" },
  { id: "matchpair", icon: "▥", name: "Match the Pair", description: "A memory flip game made from your photos", price: 59, color: "mint", category: "Playful games", message: "Find every matching memory." },
  { id: "wheel", icon: "◎", name: "Spin the wheel", description: "Custom prizes and limited spins", price: 49, color: "amber", category: "Playful games", message: "Let chance choose your surprise." },
  { id: "slots", icon: "♛", name: "Slot machine", description: "Pull the lever to reveal a prize", price: 49, color: "red", category: "Playful games", message: "Pull the lever and let the reels decide." },
  { id: "scratch", icon: "◇", name: "Scratch reveal", description: "Hide a gift, photo or promise", price: 39, color: "gold", category: "Playful games", message: "Something lovely is hiding here." },
  { id: "treasure", icon: "⌖", name: "Treasure hunt", description: "Clues that lead to a final surprise", price: 79, color: "green", category: "Playful games", message: "Follow the clues. Your surprise is waiting." },
  { id: "excuse", icon: "⚑", name: "Excuse Generator", description: "Pull a funny reason to meet right now", price: 29, color: "amber", category: "Playful games", message: "An extremely convincing reason to see me." },
  { id: "roast", icon: "♨", name: "Roast Me Gently", description: "Flip affectionate, sender-written complaints", price: 29, color: "coral", category: "Playful games", message: "A tiny complaint, delivered with a lot of love." },
  { id: "fortune", icon: "⌒", name: "Fortune Cookie Break", description: "Crack a cookie and reveal a personal fortune", price: 29, color: "gold", category: "Playful games", message: "Your future contains something lovely." },
  { id: "mysterybox", icon: "□", name: "Mystery Box", description: "Shake open one configured surprise", price: 39, color: "purple", category: "Playful games", message: "Something inside this box is waiting for you." },
  { id: "countdownus", icon: "∞", name: "Countdown to Us", description: "A live counter since your special date", price: 29, color: "rose", category: "Sentimental stories", message: "Every second since then has mattered." },
  { id: "constellation", icon: "✧", name: "Constellation Map", description: "A personal star chart with one named star", price: 49, color: "blue", category: "Sentimental stories", message: "Somewhere in this sky, one star is yours." },
  { id: "growthring", icon: "◌", name: "Growth Ring", description: "Relationship milestones drawn as tree rings", price: 49, color: "green", category: "Sentimental stories", message: "Every ring holds another chapter of us." },
  { id: "movie", icon: "▰", name: "If We Were a Movie", description: "A cinematic poster and sender-written tagline", price: 49, color: "red", category: "Sentimental stories", message: "The greatest story ever accidentally made." },
  { id: "alwaysyou", icon: "✓", name: "The Answer Was Always You", description: "A joke quiz where every answer is right", price: 29, color: "pink", category: "Sentimental stories", message: "A very serious quiz with one obvious conclusion." },
  { id: "flowers", icon: "✦", name: "Celebration scene", description: "Elegant full-screen light, petals and sparkles", price: 29, color: "pink", category: "Celebrations & gifts", message: "A beautiful celebration, just for you." },
  { id: "calendar", icon: "▣", name: "Unlock calendar", description: "7, 14 or 30 days of moments", price: 99, color: "purple", category: "Celebrations & gifts", message: "A little something, one day at a time." },
  { id: "gift", icon: "♢", name: "Gift card", description: "Wrap a real or custom voucher", price: 29, color: "red", category: "Celebrations & gifts", message: "A little treat, chosen just for you." },
  { id: "playlist", icon: "♫", name: "Playlist Reveal", description: "A typed dedication before opening your playlist", price: 39, color: "violet", category: "Plans & together", message: "A soundtrack for all the versions of us." },
  { id: "countdowninvite", icon: "◷", name: "Countdown Invite", description: "A live event countdown with a playful RSVP", price: 39, color: "amber", category: "Plans & together", message: "Save this moment. I have a plan for us." },
  { id: "groupboard", icon: "☷", name: "Group Message Board", description: "Short notes assembled into one shared card", price: 69, color: "blue", category: "Plans & together", message: "A whole group of people wanted to say this." },
];

const bundles = [
  { id: "romantic", badge: "Most loved", name: "Romantic surprise", copy: "A slow, heartfelt story made for your person.", ids: ["letter", "voice", "memory", "quiz", "flowers", "gift"], price: 249, tone: "romantic" },
  { id: "birthday", badge: "Playful", name: "Birthday adventure", copy: "Games, surprises and one very happy ending.", ids: ["letter", "puzzle", "quiz", "wheel", "scratch", "gift"], price: 279, tone: "birthday" },
  { id: "friend", badge: "Good chaos", name: "Best friend forever", copy: "Shared lore, silly questions and real appreciation.", ids: ["voice", "memory", "quiz", "puzzle", "gift"], price: 219, tone: "friend" },
];

type CatalogResponse = {
  activities: Array<{id:string;name:string;description:string;pricePaise:number;active:boolean}>;
  bundles: Array<{id:string;name:string;description:string;pricePaise:number;activityIds:string;active:boolean}>;
};

const recipients = ["Lover", "Friend", "Parents", "Sibling", "Other"];

const blockDefaults: Record<string, Record<string, string>> = {
  letter: { signoff: "— sent with love", animation: "Lift and unfold" },
  voice: { audioName: "", playbackStyle: "Classic waveform" },
  video: { videoName: "", videoUrl: "", videoEffect: "Retro cam", videoCaption: "I wanted to tell you this face to face." },
  flowers: { effect: "Rose garden", timing: "Entire show", intensity: "Lush", effectNote: "This whole moment is blooming for you." },
  quiz: { quizQuestions: JSON.stringify([{ id: "q1", question: "Where did we first meet?", options: [{ text: "At our favourite café", image: "" }, { text: "At a party", image: "" }, { text: "Online", image: "" }, { text: "I forgot", image: "" }], correctIndex: 0, interaction: "floating" }]) },
  thisorthat: { thisOrThatRounds: JSON.stringify([{prompt:"Our perfect evening",left:"Movie night",right:"Long drive"},{prompt:"Pick a treat",left:"Ice cream",right:"Chocolate"},{prompt:"Choose our trip",left:"Mountains",right:"Beach"}]) },
  emoji: { emojiClue: "☕ + 🌧 + ♡", emojiAnswer: "our rainy cafe date", emojiHint: "Think about where we hid from the rain." },
  wouldrather: { pairs: JSON.stringify([{left:"Sunrise date",right:"Midnight drive"},{left:"Beach holiday",right:"Mountain cabin"},{left:"Cook together",right:"Order everything"}]) },
  neverhave: { statements: "Danced in the kitchen\nRe-read our old chats\nPlanned a surprise date\nPretended not to miss you", shareSummary: "true" },
  truthdare: { truths: "What was your first impression of me?\nWhich memory makes you smile instantly?\nWhat is one thing you want us to try?", dares: "Send me your cutest selfie\nRecreate our first photo\nPlan our next snack date" },
  tapheart: { duration: "10", scoreTitle: "Official heart-catching score" },
  matchpair: { pairPhotos: "[]" },
  wheel: { prizes: "Breakfast in bed\nMovie night\nMystery date\nA long hug\nSweet treat", spins: "1", resultMode: "Random", plannedResults: "Breakfast in bed", revealAnimation: "Confetti burst" },
  slots: { prizes: "Movie night\nBreakfast date\nA long hug\nSweet treat", pulls: "3", resultMode: "Random", plannedResults: "", revealAnimation: "Sparkle shower" },
  puzzle: { imageUrl: "/mypookie-puzzle-picnic.png", imageName: "", difficulty: "3 × 3 · Sweet and simple", successMessage: "You put this memory back together." },
  memory: { memoryItems: "[]", coverImage: "/mypookie-letter-photo.png", coverCaption: "Our little book of us" },
  scratch: { revealText: "A candlelit dinner ♡", revealDetail: "Friday · 8:00 PM", coating: "Lilac shimmer" },
  treasure: { treasureClues: JSON.stringify([{ clue: "Start where we first said hello.", hint: "Think about our first conversation.", answer: "cafe", photo: "", caption: "" }, { clue: "Find the place in our favourite photo.", hint: "It was outdoors.", answer: "picnic", photo: "", caption: "" }]), finalSurprise: "A mystery date for us" },
  excuse: { excuses: "My coffee tastes better when you are here\nThe cat has requested your immediate presence\nI need expert help choosing dessert\nThere is an emergency hug shortage" },
  roast: { roasts: "You are terrible at saying goodbye quickly\nYou steal the blanket and somehow look innocent\nYour replies are either instant or from another century" },
  fortune: { fortunes: "A surprise date is closer than you think\nSomeone is about to miss you loudly\nYour next hug will last longer than expected" },
  mysterybox: { surprises: "Breakfast date\nA long drive\nYour favourite dessert\nOne wish granted", boxMode: "Random" },
  countdownus: { sinceDate: "2024-02-14T18:30", counterLabel: "Since our story began" },
  constellation: { starName: "Ananya's Star", starMessage: "Even in a sky full of light, I would find you.", skyStyle: "Midnight rose" },
  growthring: { milestones: JSON.stringify([{year:"2023",label:"We met"},{year:"2024",label:"Our first adventure"},{year:"2025",label:"A thousand little memories"}]) },
  movie: { genre: "Romantic comedy", movieTitle: "Us, Somehow", tagline: "Two people. Too many inside jokes. One beautiful story.", starring: "Ananya & Himanshu", posterTemplate: "Golden musical", posterImage: "" },
  alwaysyou: { question: "Who makes every ordinary day better?", answers: "You\nStill you\nObviously you\nThe person reading this" },
  calendar: { days: "7", unlockRule: "One per day", startDate: "", calendarNotes: JSON.stringify(["A reason I adore you","A favourite memory","A tiny promise","A photo that makes me smile","Your song of the day","A little challenge","Your final surprise"]) },
  gift: { brand: "Custom gift", code: "POOKIE-LOVE-24", value: "₹1,000", giftMessage: "Choose something that makes you smile.", interaction: "Flip to reveal", showCode: "true", showValue: "true", showNote: "true" },
  playlist: { playlistTitle: "Songs that feel like us", playlistUrl: "https://open.spotify.com/", dedication: "Press play whenever you want to feel a little closer to me." },
  countdowninvite: { eventTitle: "Our surprise date", eventDate: "2026-12-31T20:00", inviteNote: "Wear something that makes you feel amazing." },
  groupboard: { boardNotes: JSON.stringify([{from:"Your favourite person",message:"You make every room warmer."},{from:"Your partner in chaos",message:"Never stop being wonderfully you."}]) },
};

function createBlock(item: Block): Block {
  return { ...item, config: { ...(blockDefaults[item.id] || {}) } };
}

export default function Home() {
  const browserReady=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const urlParams=browserReady?new URLSearchParams(window.location.search):null;
  const contributionGiftId=urlParams?.get("contribute")||null;
  const publicGiftToken=urlParams?.get("gift")||null;
  const adminMode=urlParams?.get("admin")==="true";
  const [screen, setScreen] = useState<"welcome" | "catalog" | "builder" | "preview" | "checkout">("welcome");
  const [recipient, setRecipient] = useState("Lover");
  const [name, setName] = useState("Ananya");
  const [occasion, setOccasion] = useState("Just because");
  const [selected, setSelected] = useState<Block[]>([]);
  const [selectedBundleId,setSelectedBundleId]=useState<string|null>(null);
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
  const [soundtrack, setSoundtrack] = useState({ enabled: false, templateId: "warm-sunset", audioUrl: "/music/warm-sunset.mp3", name: "Warm Sunset", startMode: "From the beginning", startBlockId: "", startSeconds: "0" });
  const [revealAt,setRevealAt]=useState("");
  const [signedIn,setSignedIn]=useState(false);
  const [authError,setAuthError]=useState("");
  const [authOpen,setAuthOpen]=useState(false);
  const [afterAuth,setAfterAuth]=useState<"save"|"checkout"|null>(null);
  const [completedSteps,setCompletedSteps]=useState<number[]>([]);
  const [wonItems,setWonItems]=useState<WonItem[]>([]);
  const [winsOpen,setWinsOpen]=useState(false);
  const rewardCounter=useRef(0);
  const [catalogActivities,setCatalogActivities]=useState<Block[]>(activities);
  const [catalogBundles,setCatalogBundles]=useState(bundles);

  const subtotal = useMemo(() => selectedBundleId ? (catalogBundles.find(bundle=>bundle.id===selectedBundleId)?.price ?? selected.reduce((sum,item)=>sum+item.price,0)) : selected.reduce((sum,item)=>sum+item.price,0), [selected,selectedBundleId,catalogBundles]);
  const activeBlock = selected[active];

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(()=>watchFirebaseAuth(user=>setSignedIn(Boolean(user))),[]);

  useEffect(()=>{
    const controller=new AbortController();
    const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
    fetch(`${api}/api/catalog`,{signal:controller.signal}).then(response=>response.ok?response.json():Promise.reject()).then((catalog:CatalogResponse)=>{
      const byId=new Map(catalog.activities.map(item=>[item.id,item]));
      setCatalogActivities(activities.filter(item=>byId.has(item.id)).map(item=>{
        const managed=byId.get(item.id)!;
        return {...item,name:managed.name,description:managed.description,price:managed.pricePaise/100};
      }));
      setCatalogBundles(bundles.filter(bundle=>catalog.bundles.some(item=>item.id===bundle.id)).map(bundle=>{
        const managed=catalog.bundles.find(item=>item.id===bundle.id)!;
        let ids=bundle.ids;
        try{const parsed=JSON.parse(managed.activityIds);if(Array.isArray(parsed))ids=parsed.filter(value=>typeof value==="string")}catch{}
        return {...bundle,name:managed.name,copy:managed.description,price:managed.pricePaise/100,ids};
      }));
    }).catch(()=>{});
    return()=>controller.abort();
  },[]);

  function chooseBundle(ids: string[],bundleId:string) {
    setSelected(ids.map(id => catalogActivities.find(a => a.id === id)).filter(Boolean).map(item => createBlock(item!)));
    setSelectedBundleId(bundleId);
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
    setSelectedBundleId(null);
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
      setSelectedBundleId(null);
      setActive(selected.length);
      return;
    }
    if (existingIndex < 0) return;
    setSelected(current => current.filter(block => block.id !== item.id));
    setSelectedBundleId(null);
    setActive(current => {
      if (existingIndex < current) return current - 1;
      if (existingIndex === current) return Math.max(0, Math.min(current, selected.length - 2));
      return current;
    });
  }

  function removeActiveBlock() {
    if (!activeBlock) return;
    setSelected(current => current.filter((_, index) => index !== active));
    setSelectedBundleId(null);
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

  async function saveDraft():Promise<string|null> {
    setSaveState("saving");
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-22bd.up.railway.app";
      const body = {
        title: `${occasion} for ${name}`,
        recipientName: name,
        recipientType: recipient,
        occasion,
        theme,
        ambience,
        blocksJson: JSON.stringify({ version: 2, blocks: selected, soundtrack, bundleId:selectedBundleId }),
        scheduledAt: revealAt ? new Date(revealAt).toISOString() : null,
      };
      const response = await fetch(`${api}/api/gifts${giftId ? `/${giftId}` : ""}`, {
        method: giftId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json",...(await authHeaders()) },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Save failed");
      const gift = await response.json();
      setGiftId(gift.id);
      setSaveState("saved");
      return gift.id as string;
    } catch {
      setSaveState("offline");
      return null;
    }
  }

  function requestSignIn(action:"save"|"checkout"|null){
    setAfterAuth(action);
    setAuthOpen(true);
  }

  async function finishSignIn(provider:"google"|"apple"){
    setAuthError("");
    try{
      const user=await signInWithFirebase(provider);
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      await fetch(`${api}/api/auth/session`,{method:"POST",headers:await authHeaders()});
      setSignedIn(Boolean(user));
      setAuthOpen(false);
      if(afterAuth==="save")window.setTimeout(()=>void saveDraft(),0);
      if(afterAuth==="checkout")window.setTimeout(()=>setScreen("checkout"),0);
      setAfterAuth(null);
    }catch{
      setAuthError(provider==="apple"?"Apple sign-in needs the Apple Developer credentials to be enabled. Please use Google for now.":"Google sign-in did not finish. Please allow the popup and try again.");
    }
  }

  async function createPaymentOrder(coupon:string):Promise<PaymentOrder|null>{
    const id=await saveDraft();
    if(!id)return null;
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/orders`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({giftId:id,couponCode:coupon})});
      if(!response.ok)throw new Error();
      return await response.json() as PaymentOrder;
    }catch{
      setSaveState("offline");
      return null;
    }
  }

  async function verifyPayment(orderId:string,result:RazorpayResult){
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/orders/${orderId}/verify`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({razorpayOrderId:result.razorpay_order_id,razorpayPaymentId:result.razorpay_payment_id,razorpaySignature:result.razorpay_signature})});
      if(!response.ok)throw new Error();
      const paid=await response.json();
      return `${window.location.origin}/?gift=${paid.shareToken}`;
    }catch{return null}
  }

  async function completeDemoPayment(orderId:string){
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/orders/${orderId}/demo-complete`,{method:"POST",headers:await authHeaders()});
      if(!response.ok)throw new Error();
      const paid=await response.json();
      return `${window.location.origin}/?gift=${paid.shareToken}`;
    }catch{return null}
  }

  async function quoteCoupon(coupon:string){
    const id=giftId||await saveDraft();
    if(!id)return null;
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/orders/quote`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({giftId:id,couponCode:coupon})});
      if(!response.ok)return null;
      return await response.json() as {couponCode:string;subtotalPaise:number;discountPaise:number;totalPaise:number};
    }catch{return null}
  }

  function celebrateOccasion(type: string) {
    setOccasionFx(null);
    window.requestAnimationFrame(() => setOccasionFx(type));
    window.setTimeout(() => setOccasionFx(null), 3200);
  }


  if(!browserReady)return <main className="contribution-loading">♡</main>;
  if(adminMode)return <AdminPanel onExit={()=>window.location.assign(window.location.origin)}/>;
  if(contributionGiftId)return <GroupContributionPage inviteToken={contributionGiftId}/>;
  if(publicGiftToken)return <PublicGiftExperience token={publicGiftToken}/>;

  const signInPopup=authOpen?<SignInPopup onClose={()=>setAuthOpen(false)} onSignIn={finishSignIn} error={authError}/>:null;

  if (screen === "welcome") {
    return (
      <main className="welcome-page">
        {signInPopup}
        <div className="landing-motion" aria-hidden="true"><i/><i/><i/><span>♡</span><span>✦</span><span>✿</span></div>
        {occasionFx && <div className={`occasion-fx fx-${occasionFx}`} aria-live="polite"><div className="fx-icons">{occasionFx === "birthday" ? <><i>🎈</i><i>🎂</i><i>🎉</i><i>🎈</i><i>✨</i></> : occasionFx === "anniversary" ? <><i>♡</i><i>💐</i><i>💍</i><i>♡</i><i>✨</i></> : occasionFx === "friendship" ? <><i>🎊</i><i>📸</i><i>🥳</i><i>🎊</i><i>⭐</i></> : <><i>🌸</i><i>💌</i><i>✨</i><i>🌷</i><i>♡</i></>}</div><strong>{occasionFx === "birthday" ? "Make their birthday pop!" : occasionFx === "anniversary" ? "Celebrate every chapter." : occasionFx === "friendship" ? "For your favourite chaos." : "Because ordinary days deserve magic."}</strong></div>}
        <nav className="nav">
          <button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button>
          <div className="nav-links"><a href="#how">How it works</a><a href="#ideas">Gift ideas</a><a href="#pricing">Pricing</a></div>
          <button className="signin" onClick={() => requestSignIn(null)}>{signedIn ? "Signed in ✓" : "Continue with Google"} <span>→</span></button>
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <div className="pill"><i /> Made for the people you love</div>
            <h1>A gift they don’t just open. <em>They experience it.</em></h1>
            <p>Build a little world of messages, memories, games and surprises—personalized by you, opened by them.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setScreen("catalog")}>Create a gift <span>→</span></button>
              <button className="text-button" onClick={() => chooseBundle(catalogBundles[0]?.ids||bundles[0].ids,catalogBundles[0]?.id||bundles[0].id)}><span className="play">▶</span> Preview an experience</button>
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
        {signInPopup}
        <header className="app-header"><button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button><div className="progress"><i className="done"/><i/><i/><span>Start</span></div><button className="avatar" onClick={() => !signedIn && requestSignIn(null)}>{signedIn ? "H" : "♡"}</button></header>
        <section className="catalog-intro">
          <button className="back" onClick={() => setScreen("welcome")}>← Back</button>
          <div className="section-kicker">LET’S MAKE SOMETHING BEAUTIFUL</div>
          <h1>Who is this little world for?</h1>
          <p>We’ll personalize the ideas, wording and themes around your relationship.</p>
          <div className="recipient-row">{recipients.map(r => <button key={r} className={recipient === r ? "active" : ""} onClick={() => setRecipient(r)}><span>{r === "Lover" ? "♡" : r === "Friend" ? "☺" : r === "Parents" ? "⌂" : r === "Sibling" ? "✦" : "+"}</span>{r}</button>)}</div>
          <div className="quick-fields"><label>Their name<input value={name} onChange={e => setName(e.target.value)} /></label><label>Occasion<select value={occasion} onChange={e => setOccasion(e.target.value)}><option>Just because</option><option>Birthday</option><option>Anniversary</option><option>I’m sorry</option><option>Congratulations</option></select></label></div>
        </section>
        <section className="creation-choice">
          <div className="choice-heading"><div><div className="section-kicker">CHOOSE YOUR WAY</div><h2>Start with a story or make your own</h2></div><button className="scratch-link" onClick={() => {setSelected([]);setSelectedBundleId(null);setScreen("builder")}}>Build from scratch <span>→</span></button></div>
          <div className="bundle-grid">{catalogBundles.map((b, index) => <article className={`bundle bundle-${index}`} key={b.id}><div className="bundle-art"><span>{index === 0 ? "♡" : index === 1 ? "✦" : "☺"}</span><div className="bundle-pages"><i/><i/><i/></div></div><div className="bundle-content"><small>{b.badge}</small><h3>{b.name}</h3><p>{b.copy}</p><div className="bundle-includes">{b.ids.slice(0,4).map(id => <span key={id}>{catalogActivities.find(a => a.id === id)?.icon}</span>)}<b>+{b.ids.length-4}</b></div><div className="bundle-bottom"><strong>₹{b.price}</strong><button onClick={() => chooseBundle(b.ids,b.id)}>Choose bundle →</button></div><em>Everything can be changed</em></div></article>)}</div>
        </section>
      </main>
    );
  }

  if (screen === "checkout") {
    return <>{signInPopup}<CheckoutPage blocks={selected} name={name} occasion={occasion} subtotal={subtotal} revealAt={revealAt} onRevealAt={setRevealAt} onBack={() => setScreen("builder")} onQuote={quoteCoupon} onCreateOrder={createPaymentOrder} onVerifyPayment={verifyPayment} onDemoComplete={completeDemoPayment}/></>;
  }

  if (screen === "preview") {
    const item = selected[previewStep];
    const effectBlock = selected.find(block => block.id === "flowers");
    const effectConfig = effectBlock?.config || {};
    const effectSymbols: Record<string,string[]> = {"Rose garden":["❀","✦","·"],"Golden fireworks":["✦","✧","•"],"Birthday glow":["○","✦","⌁"],"Winter lights":["❅","✦","·"],"Floating hearts":["♡","♥","·"],"Starlight":["✦","✧","⋆"]};
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
        {showEffect && <div className={`recipient-effect-overlay effect-${(effectConfig.intensity||"Lush").toLowerCase()}`} aria-hidden="true">{Array.from({length:28},(_,index)=><i key={index} style={{left:`${(index*37)%100}%`,animationDelay:`${(index%9)*-.32}s`}}>{(effectSymbols[effectConfig.effect]||effectSymbols["Rose garden"])[index%3]}</i>)}</div>}
        <button className="exit-preview" onClick={() => setScreen("builder")}>← Back to builder</button>
        <GiftSoundtrack settings={soundtrack} blocks={selected} step={previewStep} />
        <WinningTray items={wonItems} open={winsOpen} onToggle={()=>setWinsOpen(value=>!value)} />
        <div className="recipient-experience-shell">
          <div className="preview-count">{previewStep + 1} of {selected.length}</div>
          {!item ? <div className="preview-empty"><div className="big-symbol">♡</div><h1>Your gift needs a little magic</h1><p>Add an activity in the builder to begin.</p></div> : <BuilderLivePreview key={`${item.id}-${previewStep}`} block={item} name={name} theme={theme} ambience={ambience} giftId={giftId||undefined} onInteract={()=>setOpened(true)} onComplete={completeMoment} onReward={addReward} />}
          {item && <div className="recipient-progress-gate"><button className="primary recipient-next" disabled={!currentComplete} onClick={() => { if (previewStep < selected.length-1) {setPreviewStep(previewStep+1);setOpened(false)} else {setPreviewStep(0);setOpened(false);setCompletedSteps([]);setWonItems([])} }}>{previewStep < selected.length-1 ? "Continue to the next moment" : "Experience it again"} <span>→</span></button>{!currentComplete&&<small>Complete this moment to unlock the next one</small>}{currentComplete&&<small className="ready">Moment complete ✓</small>}</div>}
        </div>
      </main>
    );
  }

  return (
    <main className="builder-page">
      {signInPopup}
      <header className="app-header builder-header"><div className="builder-brand-row"><button className="editor-back" onClick={() => setScreen("catalog")} aria-label="Go back to gift choices">← <span>Back</span></button><button className="brand" onClick={() => setScreen("welcome")}><span className="brand-heart">♥</span> mypookie.</button></div><div className="gift-title"><small>CREATING FOR</small><strong>{name || "Someone special"} <i>♡</i></strong></div><div className="header-actions"><button className="quiet" onClick={() => signedIn ? void saveDraft() : requestSignIn("save")}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "offline" ? "Backend offline · Retry" : "Save draft"}</button><button className="preview-button" onClick={launchPreview}>Preview gift <span>▶</span></button></div></header>
      <div className="builder-shell">
        <aside className="library">
          <div className="library-head"><div><div className="section-kicker">ACTIVITY LIBRARY</div><h2>Add a little magic</h2></div><span>{catalogActivities.length}</span></div>
          <p>Choose a block to add it and try it live in the centre.</p>
          <div className="activity-categories">{(["Messages & media","Memories","Playful games","Sentimental stories","Celebrations & gifts","Plans & together"] as const).map(category=><section className="activity-category" key={category}>
            <header><strong>{category}</strong><span>{catalogActivities.filter(item=>item.category===category).length}</span></header>
            <div className="activity-list">{catalogActivities.filter(item=>item.category===category).map(item => {const selectedIndex=selected.findIndex(x=>x.id===item.id);const isSelected=selectedIndex>=0;const isActive=isSelected&&active===selectedIndex;return <label className={`activity-choice ${isSelected?"selected":""} ${isActive?"active":""}`} key={item.id}>
              <input type="checkbox" checked={isSelected} onChange={event=>setActivitySelected(item,event.target.checked)} aria-label={`${isSelected?"Remove":"Add"} ${item.name}`} />
              <span className="activity-check" aria-hidden="true">{isSelected?"✓":""}</span>
              <i className={item.color}>{item.icon}</i>
              <span className="activity-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
              <b>{isActive?"LIVE":isSelected?"SELECTED":`₹${item.price}`}</b>
            </label>})}</div>
          </section>)}</div>
        </aside>
        <section className="live-editor">
          <div className="live-editor-head"><div><div className="section-kicker">LIVE RECIPIENT PREVIEW</div><h2>{activeBlock ? activeBlock.name : "Choose a block to begin"}</h2><p>{activeBlock ? "Play with it here. Changes from the right appear instantly." : "Select any activity from the library and its real interaction will appear here."}</p></div>{activeBlock && <span className="live-badge"><i /> Interactive</span>}</div>
          {activeBlock ? <BuilderLivePreview key={activeBlock.id} block={activeBlock} name={name} theme={theme} ambience={ambience} giftId={giftId||undefined} /> : <div className="empty-live-preview"><div className="empty-live-orbit"><span>✦</span><i>♡</i><b>✿</b></div><h3>Your live preview will appear here</h3><p>Try the letter, wheel, puzzle, quiz and every other block before sending it.</p><button onClick={() => selectActivity(catalogActivities[0]||activities[0])}>Start with a personal letter →</button></div>}
          {selected.length > 0 && <div className="journey-rail"><div className="journey-rail-head"><div><small>GIFT SEQUENCE</small><strong>{selected.length} moments for {name}</strong></div><span>Tap a block to edit it</span></div><div className="journey-chips">{selected.map((item,index)=><div className={`journey-chip ${active===index?"active":""}`} key={item.id}><button className="journey-select" onClick={()=>setActive(index)}><i className={item.color}>{item.icon}</i><span><small>{index+1}</small>{item.name}</span></button><div><button onClick={()=>move(index,-1)} disabled={index===0} aria-label={`Move ${item.name} earlier`}>←</button><button onClick={()=>move(index,1)} disabled={index===selected.length-1} aria-label={`Move ${item.name} later`}>→</button></div></div>)}</div></div>}
        </section>
        <aside className="customizer">
          <div className="customizer-head"><div className="section-kicker">CUSTOMIZE</div><span>{selected.length ? `${active+1} / ${selected.length}` : "0 / 0"}</span></div>
          {!activeBlock ? <div className="custom-empty"><span>✎</span><h3>Select an activity</h3><p>Choose a moment to personalize its words, behaviour and style.</p></div> : <>
            <div className="current-block"><i className={activeBlock.color}>{activeBlock.icon}</i><div><small>MOMENT {active+1}</small><h2>{activeBlock.name}</h2></div></div>
            <BlockCustomization key={activeBlock.id} block={activeBlock} giftId={giftId||undefined} onMessage={updateMessage} onConfig={updateBlockConfig} />
            <SoundtrackEditor settings={soundtrack} blocks={selected} onChange={patch=>setSoundtrack(current=>({...current,...patch}))} />
            <div className="style-row"><label className="field">Theme<select value={theme} onChange={e=>setTheme(e.target.value)}><option>Blush romance</option><option>Golden celebration</option><option>Midnight magic</option></select></label><label className="field">Ambience<select value={ambience} onChange={e=>setAmbience(e.target.value)}><option>Petals</option><option>Soft sparkles</option><option>None</option></select></label></div>
            <div className="customizer-live-note"><i /> You’re editing the live preview</div>
            <div className="next-row"><button disabled={active===0} onClick={()=>setActive(active-1)}>←</button><button onClick={()=>setActive(Math.min(active+1,selected.length-1))}>{active===selected.length-1?"Finish customization":"Save & customize next"} <span>→</span></button></div>
            <button className="remove-block" onClick={removeActiveBlock}>Remove this block</button>
          </>}
        </aside>
      </div>
      <footer className="checkout-bar"><div><small>YOUR GIFT</small><strong>{selected.length} moments for {name}</strong></div><div className="price"><span>Live total</span><strong>₹{subtotal}</strong></div><button disabled={!selected.length} onClick={() => signedIn ? setScreen("checkout") : requestSignIn("checkout")}>Checkout <span>→</span></button></footer>
    </main>
  );
}

function SignInPopup({onClose,onSignIn,error}:{onClose:()=>void;onSignIn:(provider:"google"|"apple")=>Promise<void>;error:string}){
  return <div className="signin-modal-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <section className="signin-modal" role="dialog" aria-modal="true" aria-labelledby="signin-title">
      <button className="signin-modal-close" onClick={onClose} aria-label="Close sign in">×</button>
      <div className="signin-modal-brand"><span>♥</span> mypookie.</div>
      <span className="signin-modal-heart">♡</span>
      <small>KEEP EVERY LITTLE DETAIL SAFE</small>
      <h2 id="signin-title">Sign in to keep creating.</h2>
      <p>Save drafts, return from any device, track recipient answers and see every group contribution in one place.</p>
      <div className="signin-benefits"><span>✓ Drafts stay saved</span><span>✓ Responses are tracked</span><span>✓ Private links stay manageable</span></div>
      <button className="provider-button google" onClick={()=>void onSignIn("google")}><b>G</b> Continue with Google</button>
      <button className="provider-button apple" onClick={()=>void onSignIn("apple")}><b>●</b> Continue with Apple</button>
      {error&&<output className="signin-error">{error}</output>}
      <em>Authentication is secured by Firebase. Your gift stays private.</em>
    </section>
  </div>;
}

type SoundtrackSettings = {
  enabled: boolean;
  templateId: string;
  audioUrl: string;
  name: string;
  startMode: string;
  startBlockId: string;
  startSeconds: string;
};

const soundtrackTemplates = [
  { id:"warm-sunset", name:"Warm Sunset", mood:"Golden pads · slow and cosy", url:"/music/warm-sunset.mp3", mark:"☼" },
  { id:"moonlit-keys", name:"Moonlit Keys", mood:"Dreamy notes · quiet romance", url:"/music/moonlit-keys.mp3", mark:"☾" },
  { id:"soft-rain", name:"Soft Rain", mood:"Gentle rain · calm and intimate", url:"/music/soft-rain.mp3", mark:"⌇" },
];

function SoundtrackEditor({settings,blocks,onChange}:{settings:SoundtrackSettings;blocks:Block[];onChange:(patch:Partial<SoundtrackSettings>)=>void}){
  const startBlock=settings.startBlockId&&blocks.some(block=>block.id===settings.startBlockId)?settings.startBlockId:(blocks[0]?.id||"");
  return <details className="soundtrack-editor">
    <summary><span>♫</span><div><strong>Soothing soundtrack</strong><small>{settings.enabled?settings.name:"Choose a built-in music template"}</small></div><b>{settings.enabled?"ON":"OFF"}</b></summary>
    <div className="soundtrack-body">
      <label className="soundtrack-toggle"><input type="checkbox" checked={settings.enabled} onChange={event=>onChange({enabled:event.target.checked})}/><span/><div><strong>Play background music</strong><small>The recipient can always pause or mute it.</small></div></label>
      <div className="soundtrack-template-grid">{soundtrackTemplates.map(template=><button type="button" className={`soundtrack-template-card ${settings.templateId===template.id?"selected":""}`} key={template.id} onClick={()=>onChange({templateId:template.id,audioUrl:template.url,name:template.name,enabled:true})}><span>{template.mark}</span><div><strong>{template.name}</strong><small>{template.mood}</small></div><b>{settings.templateId===template.id?"✓":"Choose"}</b></button>)}</div>
      <audio className="soundtrack-template-preview" controls preload="metadata" src={settings.audioUrl} aria-label={`Preview ${settings.name}`} />
      <p className="template-note">Music stays soft beneath the experience. Interaction and win sounds always play louder.</p>
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
    audio.volume=.14;
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
    <div><strong>{settings.name||"Soothing soundtrack"}</strong><small>{playing&&!ready?`Queued for ${target}`:playing?"Soft background · SFX stay louder":settings.startMode==="From a specific block"?`Starts at ${target}`:"Tap to play softly"}</small></div>
    {settings.audioUrl&&<audio ref={audioRef} src={settings.audioUrl} loop preload="metadata"/>}
  </div>;
}

function WinningTray({items,open,onToggle}:{items:WonItem[];open:boolean;onToggle:()=>void}){
  return <aside className={`winning-tray ${open?"open":""}`}>
    <button onClick={onToggle} aria-expanded={open}><span>🏆</span><div><strong>Things you won</strong><small>{items.length?`${items.length} collected`:"Your prizes appear here"}</small></div><b>{items.length}</b></button>
    {open&&<div className="winning-list">{items.length===0?<p>Play the games to fill this little trophy case.</p>:items.map(item=><article key={item.id}><span>✦</span><div><small>{item.source}</small><strong>{item.reward}</strong></div></article>)}</div>}
  </aside>;
}

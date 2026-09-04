"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { LandingShowcase } from "./LandingShowcase";
import { BuilderLivePreview } from "./BuilderLivePreview";
import { BlockCustomization, GifDecorationEditor } from "./BlockCustomization";
import { PlayfulAiAssistant } from "./PlayfulAiAssistant";
import { GroupContributionPage } from "./GroupContributionPage";
import {
  CheckoutPage,
  type PaymentOrder,
  type RazorpayResult,
} from "./CheckoutPage";
import { PublicGiftExperience } from "./PublicGiftExperience";
import { AdminPanel } from "./AdminPanel";
import {
  AccountMenu,
  type AccountProfile,
  type SavedDraft,
} from "./AccountMenu";
import {
  authenticateWithEmail,
  authHeaders,
  signInWithFirebase,
  signOutFirebase,
  watchFirebaseAuth,
} from "./authClient";
import { playSound } from "./soundFx";
import { GiftSoundtrack, type SoundtrackSettings } from "./GiftSoundtrack";
import {
  defaultExperienceBackground,
  experienceBackgroundStyle,
  type ExperienceBackground,
} from "./experienceBackground";

const transitionGameBlocks = new Set([
  "quiz",
  "thisorthat",
  "emoji",
  "heartcatch",
  "wouldrather",
  "neverhave",
  "truthdare",
  "tapheart",
  "matchpair",
  "wheel",
  "slots",
  "puzzle",
  "scratch",
  "treasure",
  "alwaysyou",
  "excuse",
  "roast",
  "fortune",
  "tarot",
  "drawtogether",
  "birthdaycake",
  "mysterybox",
]);

type Block = {
  instanceId?: string;
  id: string;
  icon: string;
  name: string;
  description: string;
  price: number;
  color: string;
  message: string;
  category:
    | "Messages & media"
    | "Memories"
    | "Playful games"
    | "Sentimental stories"
    | "Celebrations & gifts"
    | "Plans & together";
  config?: Record<string, string>;
};

type WonItem = { id: number; source: string; reward: string };

const activities: Block[] = [
  {
    id: "letter",
    icon: "✉",
    name: "Personal letter",
    description: "A message they tap to unfold",
    price: 29,
    color: "coral",
    category: "Messages & media",
    message: "You make ordinary days feel like celebrations.",
  },
  {
    id: "voice",
    icon: "◖",
    name: "Voice message",
    description: "Record something only you can say",
    price: 39,
    color: "violet",
    category: "Messages & media",
    message: "A little message from my heart to yours.",
  },
  {
    id: "video",
    icon: "▶",
    name: "Video note",
    description: "Upload and style a beautiful gallery video",
    price: 59,
    color: "rose",
    category: "Messages & media",
    message: "A little face-to-face moment, just for you.",
  },
  {
    id: "memory",
    icon: "⌁",
    name: "Memory lane",
    description: "Photos, dates and little stories",
    price: 79,
    color: "rose",
    category: "Memories",
    message: "Every chapter with you is my favourite.",
  },
  {
    id: "puzzle",
    icon: "▦",
    name: "Photo puzzle",
    description: "Turn a memory into a 3×3 or 4×4",
    price: 59,
    color: "mint",
    category: "Memories",
    message: "Put this favourite memory back together.",
  },
  {
    id: "quiz",
    icon: "?",
    name: "Playful quiz",
    description: "Normal scoring or disappearing wrong answers",
    price: 49,
    color: "blue",
    category: "Playful games",
    message: "How well do you know us?",
  },
  {
    id: "thisorthat",
    icon: "↔",
    name: "This or that",
    description: "Fast little choices about your story",
    price: 39,
    color: "violet",
    category: "Playful games",
    message: "No overthinking—choose your favourite.",
  },
  {
    id: "emoji",
    icon: "☺",
    name: "Emoji decoder",
    description: "Guess the memory hidden in symbols",
    price: 39,
    color: "amber",
    category: "Playful games",
    message: "Can you decode this little memory?",
  },
  {
    id: "wouldrather",
    icon: "⇄",
    name: "Would You Rather",
    description: "Swipe through sender-written either/or cards",
    price: 39,
    color: "violet",
    category: "Playful games",
    message: "Choose quickly—your picks tell a story.",
  },
  {
    id: "neverhave",
    icon: "✋",
    name: "Never Have I Ever",
    description: "A light, shareable confession deck",
    price: 39,
    color: "amber",
    category: "Playful games",
    message: "No judgement. Maybe a little teasing.",
  },
  {
    id: "truthdare",
    icon: "◉",
    name: "Truth or Dare Roulette",
    description: "Spin into sender-written truths and dares",
    price: 49,
    color: "red",
    category: "Playful games",
    message: "Let the wheel choose what happens next.",
  },
  {
    id: "tapheart",
    icon: "♥",
    name: "Tap the Hearts",
    description: "Ten seconds of fast, floating-heart taps",
    price: 39,
    color: "pink",
    category: "Playful games",
    message: "How many hearts can you catch in ten seconds?",
  },
  {
    id: "matchpair",
    icon: "▥",
    name: "Match the Pair",
    description: "A memory flip game made from your photos",
    price: 59,
    color: "mint",
    category: "Playful games",
    message: "Find every matching memory.",
  },
  {
    id: "wheel",
    icon: "◎",
    name: "Spin the wheel",
    description: "Custom prizes and limited spins",
    price: 49,
    color: "amber",
    category: "Playful games",
    message: "Let chance choose your surprise.",
  },
  {
    id: "slots",
    icon: "♛",
    name: "Slot machine",
    description: "Pull the lever to reveal a prize",
    price: 49,
    color: "red",
    category: "Playful games",
    message: "Pull the lever and let the reels decide.",
  },
  {
    id: "scratch",
    icon: "◇",
    name: "Scratch reveal",
    description: "Hide a gift, photo or promise",
    price: 39,
    color: "gold",
    category: "Playful games",
    message: "Something lovely is hiding here.",
  },
  {
    id: "treasure",
    icon: "⌖",
    name: "Treasure hunt",
    description: "Clues that lead to a final surprise",
    price: 79,
    color: "green",
    category: "Playful games",
    message: "Follow the clues. Your surprise is waiting.",
  },
  {
    id: "excuse",
    icon: "⚑",
    name: "Our Excuse Generator",
    description: "You both invent one excuse for the same situation",
    price: 29,
    color: "amber",
    category: "Playful games",
    message: "Two excuses. One suspiciously convincing plan.",
  },
  {
    id: "roast",
    icon: "♨",
    name: "Roast Me Gently",
    description: "Flip affectionate, sender-written complaints",
    price: 29,
    color: "coral",
    category: "Playful games",
    message: "A tiny complaint, delivered with a lot of love.",
  },
  {
    id: "fortune",
    icon: "⌒",
    name: "Fortune Cookie Break",
    description: "Crack a cookie and reveal a personal fortune",
    price: 29,
    color: "gold",
    category: "Playful games",
    message: "Your future contains something lovely.",
  },
  {
    id: "tarot",
    icon: "☾",
    name: "Tarot Cat Fortune",
    description: "Choose one of nine AI-written fortune cards",
    price: 59,
    color: "purple",
    category: "Playful games",
    message: "The cards have a little secret for you.",
  },
  {
    id: "drawtogether",
    icon: "✎",
    name: "Draw Together",
    description: "Draw the same prompt and compare your creations",
    price: 59,
    color: "violet",
    category: "Playful games",
    message: "One prompt. Two wonderfully different imaginations.",
  },
  {
    id: "birthdaycake",
    icon: "🎂",
    name: "Birthday Cake Wish",
    description: "Light the candles, make a wish and cut the cake",
    price: 59,
    color: "rose",
    category: "Celebrations & gifts",
    message: "A birthday wish made especially for you.",
  },
  {
    id: "mysterybox",
    icon: "□",
    name: "Mystery Box",
    description: "Shake open one configured surprise",
    price: 39,
    color: "purple",
    category: "Playful games",
    message: "Something inside this box is waiting for you.",
  },
  {
    id: "countdownus",
    icon: "∞",
    name: "Countdown to Us",
    description: "A live counter since your special date",
    price: 29,
    color: "rose",
    category: "Sentimental stories",
    message: "Every second since then has mattered.",
  },
  {
    id: "constellation",
    icon: "✧",
    name: "Constellation Map",
    description: "A personal star chart with one named star",
    price: 49,
    color: "blue",
    category: "Sentimental stories",
    message: "Somewhere in this sky, one star is yours.",
  },
  {
    id: "growthring",
    icon: "◌",
    name: "Growth Ring",
    description: "Relationship milestones drawn as tree rings",
    price: 49,
    color: "green",
    category: "Sentimental stories",
    message: "Every ring holds another chapter of us.",
  },
  {
    id: "movie",
    icon: "▰",
    name: "If Your Story Was a Movie",
    description: "A cinematic poster and sender-written tagline",
    price: 49,
    color: "red",
    category: "Sentimental stories",
    message: "The greatest story ever accidentally made.",
  },
  {
    id: "song",
    icon: "♪",
    name: "If We Were a Song",
    description: "Answer together and reveal the song of your bond",
    price: 49,
    color: "violet",
    category: "Sentimental stories",
    message: "Somehow, every chapter of us has a melody.",
  },
  {
    id: "alwaysyou",
    icon: "✓",
    name: "The Answer Was Always You",
    description: "A joke quiz where every answer is right",
    price: 29,
    color: "pink",
    category: "Sentimental stories",
    message: "A very serious quiz with one obvious conclusion.",
  },
  {
    id: "calendar",
    icon: "▣",
    name: "Unlock calendar",
    description: "7, 14 or 30 days of moments",
    price: 99,
    color: "purple",
    category: "Celebrations & gifts",
    message: "A little something, one day at a time.",
  },
  {
    id: "gift",
    icon: "♢",
    name: "Gift card",
    description: "Wrap a real or custom voucher",
    price: 29,
    color: "red",
    category: "Celebrations & gifts",
    message: "A little treat, chosen just for you.",
  },
  {
    id: "playlist",
    icon: "♫",
    name: "Playlist Reveal",
    description: "A typed dedication before opening your playlist",
    price: 39,
    color: "violet",
    category: "Plans & together",
    message: "A soundtrack for all the versions of us.",
  },
  {
    id: "countdowninvite",
    icon: "◷",
    name: "Countdown Invite",
    description: "A live event countdown with a playful RSVP",
    price: 39,
    color: "amber",
    category: "Plans & together",
    message: "Save this moment. I have a plan for us.",
  },
  {
    id: "groupboard",
    icon: "☷",
    name: "Group Message Board",
    description: "Short notes assembled into one shared card",
    price: 69,
    color: "blue",
    category: "Plans & together",
    message: "A whole group of people wanted to say this.",
  },
];

const recipients = ["Lover", "Friend", "Parents", "Sibling", "Other"] as const;
type Recipient = (typeof recipients)[number];
type BundlePreset = {
  id: string;
  badge: string;
  name: string;
  copy: string;
  ids: string[];
  price: number;
  tone: string;
  recipientType: Recipient;
};

const bundles: BundlePreset[] = [
  {
    id: "romantic",
    badge: "Most loved",
    name: "Romantic surprise",
    copy: "A slow, heartfelt story made for your person.",
    ids: ["letter", "voice", "memory", "quiz", "flowers", "gift"],
    price: 249,
    tone: "romantic",
    recipientType: "Lover",
  },
  {
    id: "lover-date",
    badge: "Date night",
    name: "Our perfect date",
    copy: "A playful invitation that ends with a real plan together.",
    ids: ["playlist", "countdowninvite", "wheel", "gift", "flowers"],
    price: 169,
    tone: "date",
    recipientType: "Lover",
  },
  {
    id: "lover-distance",
    badge: "Across miles",
    name: "Closer to you",
    copy: "Voice, video and little moments for when distance feels too big.",
    ids: ["video", "playlist", "countdownus", "calendar", "letter"],
    price: 229,
    tone: "distance",
    recipientType: "Lover",
  },
  {
    id: "friend",
    badge: "Bestie pick",
    name: "Best friend forever",
    copy: "Shared lore, silly questions and real appreciation.",
    ids: ["voice", "memory", "quiz", "puzzle", "gift"],
    price: 219,
    tone: "friend",
    recipientType: "Friend",
  },
  {
    id: "friend-chaos",
    badge: "Good chaos",
    name: "Certified chaos",
    copy: "Confessions, roulette and ridiculous surprises made for best friends.",
    ids: ["wouldrather", "neverhave", "truthdare", "slots", "fortune"],
    price: 179,
    tone: "chaos",
    recipientType: "Friend",
  },
  {
    id: "friend-birthday",
    badge: "Big energy",
    name: "Bestie birthday blast",
    copy: "Photos, games and group wishes for their loudest birthday yet.",
    ids: ["video", "memory", "puzzle", "tapheart", "groupboard", "flowers"],
    price: 289,
    tone: "birthday",
    recipientType: "Friend",
  },
  {
    id: "parents-thanks",
    badge: "From the heart",
    name: "Everything you gave me",
    copy: "A warm thank-you told through words, memories and one thoughtful gift.",
    ids: ["letter", "voice", "memory", "flowers", "gift"],
    price: 179,
    tone: "gratitude",
    recipientType: "Parents",
  },
  {
    id: "parents-memory",
    badge: "Family favourite",
    name: "Our family album",
    copy: "A beautiful family story with photos, milestones and music.",
    ids: ["video", "memory", "puzzle", "growthring", "playlist"],
    price: 249,
    tone: "family",
    recipientType: "Parents",
  },
  {
    id: "parents-celebrate",
    badge: "Together",
    name: "Celebrate Mom & Dad",
    copy: "Messages from everyone, a glowing reveal and a plan to celebrate.",
    ids: ["groupboard", "video", "flowers", "gift", "countdowninvite"],
    price: 199,
    tone: "celebration",
    recipientType: "Parents",
  },
  {
    id: "sibling-bestie",
    badge: "Built-in bestie",
    name: "Partners since forever",
    copy: "Childhood memories, inside jokes and the appreciation you rarely say.",
    ids: ["voice", "memory", "quiz", "matchpair", "gift"],
    price: 219,
    tone: "sibling",
    recipientType: "Sibling",
  },
  {
    id: "sibling-nostalgia",
    badge: "Throwback",
    name: "Back to our childhood",
    copy: "Retro photos, puzzles, decoded memories and your shared soundtrack.",
    ids: ["memory", "puzzle", "emoji", "roast", "playlist"],
    price: 209,
    tone: "nostalgia",
    recipientType: "Sibling",
  },
  {
    id: "sibling-roast",
    badge: "Playful",
    name: "Roast, reveal, repeat",
    copy: "A loving dose of sibling rivalry with games and mystery prizes.",
    ids: ["neverhave", "truthdare", "roast", "slots", "mysterybox"],
    price: 179,
    tone: "roast",
    recipientType: "Sibling",
  },
  {
    id: "birthday",
    badge: "Birthday ready",
    name: "Birthday spotlight",
    copy: "Games, surprises and one very happy ending for anyone you adore.",
    ids: ["letter", "puzzle", "quiz", "wheel", "scratch", "gift"],
    price: 229,
    tone: "birthday",
    recipientType: "Other",
  },
  {
    id: "other-appreciation",
    badge: "For anyone",
    name: "You matter to me",
    copy: "A thoughtful all-purpose bundle for mentors, cousins and special people.",
    ids: ["letter", "voice", "memory", "groupboard", "flowers"],
    price: 219,
    tone: "appreciation",
    recipientType: "Other",
  },
  {
    id: "other-celebration",
    badge: "Big reveal",
    name: "The celebration box",
    copy: "A lively mix of video, games, reveals and a final gift.",
    ids: ["video", "wheel", "slots", "scratch", "flowers", "gift"],
    price: 229,
    tone: "celebration",
    recipientType: "Other",
  },
];

type CatalogResponse = {
  activities: Array<{
    id: string;
    name: string;
    description: string;
    pricePaise: number;
    active: boolean;
  }>;
  bundles: Array<{
    id: string;
    name: string;
    description: string;
    pricePaise: number;
    activityIds: string;
    recipientType: Recipient;
    active: boolean;
  }>;
};

const ROOT_ADMIN_EMAILS = new Set([
  "himaanshushekharr.pvt@gmail.com",
  "himanshushekharr.pvt@gmail.com",
]);

const funBondQuestions = [
  "Where did you first meet?",
  "What do you always laugh about?",
  "What snack do you usually share?",
  "Who texts first most often?",
  "Which day together do you remember most?",
  "What little habit of theirs makes you smile?",
];

const blockDefaults: Record<string, Record<string, string>> = {
  letter: {
    signoff: "— sent with love",
    animation: "Flower burst",
    envelopeStyle: "Blush satin",
    frontText: "For someone wonderful",
    backText: "Sealed with love",
    envelopeSeal: "Wax heart",
    stampStyle: "Rose stamp",
    stickerStyle: "Daisies",
    pageType: "Classic cream",
    letterFont: "Handwritten",
    letterColor: "#3f3036",
    effectDensity: "22",
  },
  voice: { audioName: "", playbackStyle: "Classic waveform" },
  video: {
    videoName: "",
    videoUrl: "",
    videoFrame: "Retro cam",
    videoCaption: "I wanted to tell you this face to face.",
    videoCaptionFont: "Handwritten",
    videoCaptionColor: "#3f3036",
    videoShower: "Petal shower",
    videoShowerDensity: "18",
  },
  flowers: {
    effect: "Rose garden",
    timing: "Entire show",
    intensity: "Lush",
    celebrationTitle: "Rose garden",
    effectNote: "This whole moment is blooming for you.",
    celebrationHint: "Tap to light up the moment",
  },
  quiz: {
    quizQuestions: JSON.stringify([
      {
        id: "q1",
        question: "Where did we first meet?",
        options: [
          { text: "At our favourite café", image: "" },
          { text: "At a party", image: "" },
          { text: "Online", image: "" },
          { text: "I forgot", image: "" },
        ],
        correctIndex: 0,
        interaction: "normal",
      },
    ]),
  },
  thisorthat: {
    thisOrThatRounds: JSON.stringify([
      {
        prompt: "Our perfect evening",
        left: "Movie night",
        right: "Long drive",
      },
      { prompt: "Pick a treat", left: "Ice cream", right: "Chocolate" },
      { prompt: "Choose our trip", left: "Mountains", right: "Beach" },
    ]),
  },
  emoji: {
    emojiClue: "☕ + 🌧 + ♡",
    emojiAnswer: "our rainy cafe date",
    emojiHint: "Think about where we hid from the rain.",
  },
  wouldrather: {
    pairs: JSON.stringify([
      { left: "Sunrise date", right: "Midnight drive" },
      { left: "Beach holiday", right: "Mountain cabin" },
      { left: "Cook together", right: "Order everything" },
    ]),
  },
  neverhave: {
    statements:
      "Danced in the kitchen\nRe-read our old chats\nPlanned a surprise date\nPretended not to miss you",
    shareSummary: "true",
  },
  truthdare: {
    truths:
      "What was your first impression of me?\nWhich memory makes you smile instantly?\nWhat is one thing you want us to try?",
    dares:
      "Send me your cutest selfie\nRecreate our first photo\nPlan our next snack date",
    truthDareSpins: "1",
  },
  tapheart: {
    duration: "10",
    scoreTitle: "Official heart-catching score",
    tapImage: "",
    tapImageName: "",
    avoidImage: "",
    tapLevels: "1",
    tapTries: "3",
    tapTargetLabel: "hearts",
  },
  matchpair: { pairPhotos: "[]", matchGrid: "8 cards · 4 pairs" },
  wheel: {
    prizes:
      "Breakfast in bed\nMovie night\nMystery date\nA long hug\nSweet treat",
    spins: "1",
    resultMode: "Random",
    plannedResults: "Breakfast in bed",
    revealAnimation: "Confetti burst",
  },
  slots: {
    prizes: "Movie night\nBreakfast date\nA long hug\nSweet treat",
    pulls: "3",
    resultMode: "Random",
    plannedResults: "",
    revealAnimation: "Sparkle shower",
  },
  puzzle: {
    imageUrl: "/mypookie-puzzle-picnic.png",
    imageName: "",
    difficulty: "3 × 3 · Sweet and simple",
    autoSolver: "false",
    successMessage: "You put this memory back together.",
  },
  memory: {
    memoryItems: "[]",
    coverImage: "/mypookie-letter-photo.png",
    coverCaption: "Our little album of us",
    albumStyle: "Blush scrapbook",
    albumFont: "Handwritten",
    albumTextColor: "#49343e",
    extraPages: "false",
  },
  scratch: {
    revealText: "A candlelit dinner ♡",
    revealDetail: "Friday · 8:00 PM",
    coating: "Lilac shimmer",
  },
  treasure: {
    treasureClues: JSON.stringify([
      {
        clue: "Start where we first said hello.",
        hint: "Think about our first conversation.",
        answer: "cafe",
        photo: "",
        caption: "",
      },
      {
        clue: "Find the place in our favourite photo.",
        hint: "It was outdoors.",
        answer: "picnic",
        photo: "",
        caption: "",
      },
    ]),
    finalSurprise: "A mystery date for us",
  },
  excuse: {
    excuses:
      "My coffee tastes better when you are here\nThe cat has requested your immediate presence\nI need expert help choosing dessert\nThere is an emergency hug shortage",
    excuseRounds: JSON.stringify([
      {
        id: "excuse-1",
        situation: "We both need an excuse to meet tonight.",
        senderExcuse:
          "There is an emergency hug shortage and only you can fix it.",
      },
      {
        id: "excuse-2",
        situation: "We want to escape a boring plan together.",
        senderExcuse:
          "Our imaginary cat has scheduled a very important family meeting.",
      },
    ]),
  },
  roast: {
    roasts:
      "You are terrible at saying goodbye quickly\nYou steal the blanket and somehow look innocent\nYour replies are either instant or from another century",
  },
  fortune: {
    fortunes:
      "A surprise date is closer than you think\nSomeone is about to miss you loudly\nYour next hug will last longer than expected",
  },
  tarot: {
    tarotTheme: "love, joy and gentle new beginnings",
  },
  drawtogether: {
    drawPrompt: "A flower",
    senderDrawing: "",
  },
  birthdaycake: {
    birthdayName: "Birthday star",
    birthdayMessage: "Make a wish — today is entirely yours!",
    cakeFlavor: "Strawberry dream",
    birthdayBody: "Superhero",
    faceImage: "",
  },
  mysterybox: {
    surprises:
      "Breakfast date\nA long drive\nYour favourite dessert\nOne wish granted",
    boxMode: "Random",
  },
  countdownus: {
    sinceDate: "2024-02-14T18:30",
    counterLabel: "Since our story began",
  },
  constellation: {
    starName: "Ananya's Star",
    starMessage: "Even in a sky full of light, I would find you.",
    skyStyle: "Midnight rose",
  },
  growthring: {
    growthSenderMemories: JSON.stringify([
      "The day our story really began",
      "The adventure we still laugh about",
      "The moment I knew this bond was special",
    ]),
  },
  movie: {
    genre: "Romantic comedy",
    movieTitle: "Us, Somehow",
    tagline: "Two people. Too many inside jokes. One beautiful story.",
    starring: "Ananya & Himanshu",
    posterTemplate: "Golden musical",
    posterImage: "",
    bondQuestions: JSON.stringify(funBondQuestions),
    senderBondAnswers: "[]",
    bondQuestionTone: "Playful",
  },
  song: {
    songStyle: "Dreamy acoustic",
    bondQuestions: JSON.stringify(funBondQuestions),
    senderBondAnswers: "[]",
    bondQuestionTone: "Playful",
  },
  alwaysyou: {
    question: "Who makes every ordinary day better?",
    answers: "You\nStill you\nObviously you\nThe person reading this",
    alwaysYouQuestions: JSON.stringify([
      {
        id: "always-1",
        question: "Who makes every ordinary day better?",
        answers: [
          "You",
          "Still you",
          "Obviously you",
          "The person reading this",
        ],
      },
      {
        id: "always-2",
        question: "Who deserves the biggest hug today?",
        answers: [
          "You",
          "Definitely you",
          "No doubt—you",
          "The lovely person reading this",
        ],
      },
    ]),
  },
  calendar: {
    days: "7",
    unlockRule: "One per day",
    startDate: "",
    calendarNotes: JSON.stringify([
      "A reason I adore you",
      "A favourite memory",
      "A tiny promise",
      "A photo that makes me smile",
      "Your song of the day",
      "A little challenge",
      "Your final surprise",
    ]),
  },
  gift: {
    brand: "Custom gift",
    code: "POOKIE-LOVE-24",
    value: "₹1,000",
    giftMessage: "Choose something that makes you smile.",
    interaction: "Scratchable card",
    showCode: "true",
    showValue: "true",
    showNote: "true",
  },
  playlist: {
    playlistTitle: "Songs that feel like us",
    playlistUrl: "https://open.spotify.com/",
    dedication: "Press play whenever you want to feel a little closer to me.",
  },
  countdowninvite: {
    eventTitle: "Our surprise date",
    eventDate: "2026-12-31T20:00",
    inviteNote: "Wear something that makes you feel amazing.",
  },
  groupboard: {
    boardNotes: JSON.stringify([
      { from: "Your favourite person", message: "You make every room warmer." },
      {
        from: "Your partner in chaos",
        message: "Never stop being wonderfully you.",
      },
    ]),
  },
};

function createBlock(item: Block): Block {
  const instanceId =
    globalThis.crypto?.randomUUID?.() ||
    `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { ...item, instanceId, config: { ...(blockDefaults[item.id] || {}) } };
}

export default function Home() {
  const browserReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const urlParams = browserReady
    ? new URLSearchParams(window.location.search)
    : null;
  const contributionGiftId = urlParams?.get("contribute") || null;
  const publicGiftToken = urlParams?.get("gift") || null;
  const adminMode = urlParams?.get("admin") === "true";
  const [screen, setScreen] = useState<
    "welcome" | "catalog" | "builder" | "preview" | "checkout"
  >("welcome");
  const [recipient, setRecipient] = useState<Recipient>("Lover");
  const [name, setName] = useState("Ananya");
  const [recipientGender, setRecipientGender] = useState<
    "Girl" | "Boy" | "Neutral" | ""
  >("");
  const [senderName, setSenderName] = useState("");
  const [occasion, setOccasion] = useState("Just because");
  const [selected, setSelected] = useState<Block[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [libraryPreview, setLibraryPreview] = useState<Block | null>(null);
  const [theme, setTheme] = useState("Blush romance");
  const [ambience, setAmbience] = useState("Petals");
  const [experienceBackground, setExperienceBackground] =
    useState<ExperienceBackground>(defaultExperienceBackground);
  const [builderTransitionPreview, setBuilderTransitionPreview] =
    useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewOrigin, setPreviewOrigin] = useState<"welcome" | "builder">(
    "builder",
  );
  const [opened, setOpened] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "offline"
  >("idle");
  const [giftId, setGiftId] = useState<string | null>(null);
  const [heroStage, setHeroStage] = useState<"closed" | "open" | "flipped">(
    "closed",
  );
  const [currentTime, setCurrentTime] = useState("");
  const [occasionFx, setOccasionFx] = useState<string | null>(null);
  const [soundtrack, setSoundtrack] = useState({
    enabled: false,
    templateId: "until-i-found-you",
    audioUrl: "/api/music/until-i-found-you",
    name: "Until I Found You",
    startMode: "From the beginning",
    startBlockId: "",
    startSeconds: "0",
    endSeconds: "",
    fadeInSeconds: "2",
    fadeOutSeconds: "2",
    fadeIn: true,
    fadeOut: true,
    loop: false,
    allowMultiple: false,
    tracks: [
      {
        id: "until-i-found-you",
        name: "Until I Found You",
        url: "/api/music/until-i-found-you",
        startSeconds: "0",
        endSeconds: "",
      },
    ],
  });
  const [soundtrackOpen, setSoundtrackOpen] = useState(false);
  const [builderPreviewNonce, setBuilderPreviewNonce] = useState(0);
  const [blockPreviewFullscreen, setBlockPreviewFullscreen] = useState(false);
  const [mobileCustomizerOpen, setMobileCustomizerOpen] = useState(false);
  const [revealAt, setRevealAt] = useState("");
  const [compatibilityPin, setCompatibilityPin] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [maxOpenCount, setMaxOpenCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(
    null,
  );
  const [authError, setAuthError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [afterAuth, setAfterAuth] = useState<"save" | "checkout" | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wonItems, setWonItems] = useState<WonItem[]>([]);
  const [winsOpen, setWinsOpen] = useState(false);
  const rewardCounter = useRef(0);
  const [catalogActivities, setCatalogActivities] =
    useState<Block[]>(activities.filter((item) => item.id !== "constellation"));
  const [catalogBundles, setCatalogBundles] = useState(bundles);
  const deepLinkApplied = useRef(false);
  const [workspaceReady, setWorkspaceReady] = useState(false);

  useEffect(() => {
    if (!browserReady || deepLinkApplied.current) return;
    if (urlParams?.get("start") !== "celebration") return;
    deepLinkApplied.current = true;
    const requestedRecipient = urlParams.get("recipient");
    if (
      requestedRecipient === "Lover" ||
      requestedRecipient === "Friend" ||
      requestedRecipient === "Parents" ||
      requestedRecipient === "Sibling" ||
      requestedRecipient === "Other"
    )
      setRecipient(requestedRecipient);
    setOccasion(urlParams.get("occasion") || "Raksha Bandhan");
    setTheme("Golden celebration");
    setScreen("catalog");
  }, [browserReady, urlParams]);

  useEffect(() => {
    if (!browserReady || workspaceReady) return;
    if (
      contributionGiftId ||
      publicGiftToken ||
      adminMode ||
      urlParams?.get("start")
    ) {
      setWorkspaceReady(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem("mypookie-workstation-v1");
      if (raw) {
        const saved = JSON.parse(raw) as {
          screen?: string;
          recipient?: Recipient;
          name?: string;
          recipientGender?: "Girl" | "Boy" | "Neutral" | "";
          senderName?: string;
          occasion?: string;
          selected?: Block[];
          selectedBundleId?: string | null;
          active?: number;
          theme?: string;
          ambience?: string;
          soundtrack?: typeof soundtrack;
          giftId?: string | null;
        };
        if (recipients.includes(saved.recipient as Recipient))
          setRecipient(saved.recipient as Recipient);
        if (typeof saved.name === "string") setName(saved.name);
        if (typeof saved.senderName === "string")
          setSenderName(saved.senderName);
        if (typeof saved.occasion === "string") setOccasion(saved.occasion);
        if (saved.recipientGender !== undefined)
          setRecipientGender(saved.recipientGender);
        if (Array.isArray(saved.selected)) setSelected(saved.selected);
        setSelectedBundleId(saved.selectedBundleId || null);
        setActive(Math.max(0, Number(saved.active) || 0));
        if (typeof saved.theme === "string") setTheme(saved.theme);
        if (typeof saved.ambience === "string") setAmbience(saved.ambience);
        if (saved.soundtrack) setSoundtrack(saved.soundtrack);
        setGiftId(saved.giftId || null);
        if (saved.screen === "catalog") setScreen("catalog");
        else if (
          ["builder", "preview", "checkout"].includes(saved.screen || "")
        )
          setScreen("builder");
      }
    } catch {
      window.localStorage.removeItem("mypookie-workstation-v1");
    } finally {
      setWorkspaceReady(true);
    }
  }, [
    adminMode,
    browserReady,
    contributionGiftId,
    publicGiftToken,
    urlParams,
    workspaceReady,
  ]);

  useEffect(() => {
    if (
      !browserReady ||
      !workspaceReady ||
      contributionGiftId ||
      publicGiftToken ||
      adminMode ||
      urlParams?.get("start")
    )
      return;
    if (screen === "welcome") {
      window.localStorage.removeItem("mypookie-workstation-v1");
      return;
    }
    try {
      window.localStorage.setItem(
        "mypookie-workstation-v1",
        JSON.stringify({
          screen,
          recipient,
          name,
          recipientGender,
          senderName,
          occasion,
          selected,
          selectedBundleId,
          active,
          theme,
          ambience,
          soundtrack,
          giftId,
        }),
      );
    } catch {
      // Storage can be unavailable or full when users add large local photos.
    }
  }, [
    active,
    adminMode,
    ambience,
    browserReady,
    contributionGiftId,
    giftId,
    name,
    occasion,
    publicGiftToken,
    recipient,
    recipientGender,
    screen,
    selected,
    selectedBundleId,
    senderName,
    soundtrack,
    theme,
    urlParams,
    workspaceReady,
  ]);

  const subtotal = useMemo(() => {
    const base = selectedBundleId
      ? (catalogBundles.find((bundle) => bundle.id === selectedBundleId)
          ?.price ?? selected.reduce((sum, item) => sum + item.price, 0))
      : selected.reduce((sum, item) => sum + item.price, 0);
    const addOns =
      selected.filter(
        (item) => item.id === "memory" && item.config?.extraPages === "true",
      ).length * 20;
    return base + addOns;
  }, [selected, selectedBundleId, catalogBundles]);
  const activeBlock = libraryPreview || selected[active];
  const visibleBundles = catalogBundles.filter(
    (bundle) => bundle.recipientType === recipient,
  );

  useEffect(() => {
    const updateClock = () =>
      setCurrentTime(
        new Intl.DateTimeFormat([], {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(
    () =>
      watchFirebaseAuth((user) => {
        setSignedIn(Boolean(user));
        setAccountProfile(
          user
            ? {
                email: user.email || "",
                displayName: user.displayName || "",
                photoURL: user.photoURL || "",
              }
            : null,
        );
      }),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    const api =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://backend-production-22bd.up.railway.app";
    fetch(`${api}/api/catalog`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((catalog: CatalogResponse) => {
        const byId = new Map(catalog.activities.map((item) => [item.id, item]));
        setCatalogActivities(
          activities
            .filter((item) => item.id !== "constellation")
            .filter((item) => byId.has(item.id))
            .map((item) => {
              const managed = byId.get(item.id)!;
              return {
                ...item,
                name: managed.name,
                description: managed.description,
                price: managed.pricePaise / 100,
              };
            }),
        );
        setCatalogBundles(
          bundles
            .filter((bundle) =>
              catalog.bundles.some((item) => item.id === bundle.id),
            )
            .map((bundle) => {
              const managed = catalog.bundles.find(
                (item) => item.id === bundle.id,
              )!;
              let ids = bundle.ids;
              try {
                const parsed = JSON.parse(managed.activityIds);
                if (Array.isArray(parsed))
                  ids = parsed.filter((value) => typeof value === "string");
              } catch {}
              return {
                ...bundle,
                name: managed.name,
                copy: managed.description,
                price: managed.pricePaise / 100,
                ids,
                recipientType: managed.recipientType,
              };
            }),
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function chooseBundle(ids: string[], bundleId: string) {
    setSelected(
      ids
        .map((id) => catalogActivities.find((a) => a.id === id))
        .filter(Boolean)
        .map((item) => createBlock(item!)),
    );
    setSelectedBundleId(bundleId);
    setActive(0);
    setScreen("builder");
  }

  function selectActivity(item: Block) {
    setLibraryPreview(null);
    const existingIndex = selected.findIndex((x) => x.id === item.id);
    if (existingIndex >= 0) {
      setActive(existingIndex);
      return;
    }
    setSelected((current) => [...current, createBlock(item)]);
    setSelectedBundleId(null);
    setActive(selected.length);
  }

  function setActivitySelected(item: Block, checked: boolean) {
    setLibraryPreview(null);
    const existingIndex = selected.findIndex((block) => block.id === item.id);
    if (checked) {
      if (existingIndex >= 0) {
        setActive(existingIndex);
        return;
      }
      setSelected((current) => [...current, createBlock(item)]);
      setSelectedBundleId(null);
      setActive(selected.length);
      return;
    }
    if (existingIndex < 0) return;
    setSelected((current) => current.filter((block) => block.id !== item.id));
    setSelectedBundleId(null);
    setActive((current) => {
      if (existingIndex < current) return current - 1;
      if (existingIndex === current)
        return Math.max(0, Math.min(current, selected.length - 2));
      return current;
    });
  }

  function removeActiveBlock() {
    if (!activeBlock) return;
    setSelected((current) => current.filter((_, index) => index !== active));
    setSelectedBundleId(null);
    setActive((current) => Math.max(0, Math.min(current, selected.length - 2)));
  }

  function duplicateActiveBlock() {
    if (!activeBlock) return;
    const duplicate = createBlock({
      ...activeBlock,
      config: { ...(activeBlock.config || {}) },
    });
    duplicate.message = activeBlock.message;
    duplicate.config = { ...(activeBlock.config || {}) };
    setSelected((current) => [
      ...current.slice(0, active + 1),
      duplicate,
      ...current.slice(active + 1),
    ]);
    setSelectedBundleId(null);
    setActive(active + 1);
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
    setSelected((current) =>
      current.map((b, index) =>
        index === active ? { ...b, message: value } : b,
      ),
    );
  }

  function updateBlockConfig(key: string, value: string) {
    setSelected((current) =>
      current.map((block, index) =>
        index === active
          ? { ...block, config: { ...(block.config || {}), [key]: value } }
          : block,
      ),
    );
  }

  async function uploadExperienceBackground(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      const body = new FormData();
      body.append("file", file);
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/media/image`, {
        method: "POST",
        headers: await authHeaders(),
        body,
      });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { url: string };
      setExperienceBackground((current) => ({
        ...current,
        imageUrl: result.url,
      }));
    } catch {
      setSaveState("offline");
    }
  }

  function launchPreview() {
    setPreviewOrigin("builder");
    setPreviewStep(0);
    setOpened(false);
    setCompletedSteps([]);
    setWonItems([]);
    setWinsOpen(false);
    setScreen("preview");
  }

  function launchDemoGift() {
    const demoIds = ["letter", "memory", "thisorthat", "wheel", "scratch"];
    const demo = demoIds.map((id) =>
      createBlock(
        (catalogActivities.find((item) => item.id === id) ||
          activities.find((item) => item.id === id))!,
      ),
    );
    const byId = new Map(demo.map((block) => [block.id, block]));
    const letter = byId.get("letter");
    if (letter) {
      letter.message =
        "You deserve a little corner of the internet made only to make you smile.";
      letter.config = {
        ...(letter.config || {}),
        frontText: "For you",
        backText: "A tiny preview from mypookie.",
        animation: "Flower burst",
      };
    }
    const memory = byId.get("memory");
    if (memory)
      memory.config = {
        ...(memory.config || {}),
        coverCaption: "A tiny album of lovely moments",
        memoryItems: JSON.stringify([
          {
            id: "demo-memory-1",
            image: "/mypookie-puzzle-picnic.png",
            caption: "The days worth keeping",
            note: "Every ordinary afternoon can become a favourite chapter.",
            arrow: "Curve right",
            animation: "Polaroid pop",
          },
          {
            id: "demo-memory-2",
            image: "/mypookie-letter-photo.png",
            caption: "One more page",
            note: "The real gift will hold your photos, words and inside jokes.",
            arrow: "Curve left",
            animation: "Soft zoom",
          },
        ]),
      };
    const choices = byId.get("thisorthat");
    if (choices)
      choices.config = {
        ...(choices.config || {}),
        thisOrThatRounds: JSON.stringify([
          {
            prompt: "Pick your ideal surprise",
            left: "A midnight drive",
            right: "A cosy movie",
          },
          {
            prompt: "Choose the happy ending",
            left: "Dessert first",
            right: "One more adventure",
          },
          {
            prompt: "What makes a gift special?",
            left: "The memory",
            right: "The person",
          },
        ]),
        compatibilityEnabled: "false",
      };
    const wheel = byId.get("wheel");
    if (wheel)
      wheel.config = {
        ...(wheel.config || {}),
        prizes:
          "Movie night\nSweet treat\nYour choice\nA long hug\nMystery date",
        spins: "1",
        resultMode: "Random",
      };
    const scratch = byId.get("scratch");
    if (scratch)
      scratch.config = {
        ...(scratch.config || {}),
        revealText: "Now imagine this made just for them ♡",
        revealDetail: "Build yours in a few beautiful steps",
      };
    setSelected(demo);
    setSelectedBundleId(null);
    setName("You");
    setSenderName("mypookie.");
    setPreviewOrigin("welcome");
    setPreviewStep(0);
    setOpened(false);
    setCompletedSteps([]);
    setWonItems([]);
    setWinsOpen(false);
    setScreen("preview");
  }

  function openSavedDraft(draft: SavedDraft) {
    try {
      const parsed = JSON.parse(draft.blocksJson) as
        | {
            blocks?: Block[];
            soundtrack?: typeof soundtrack;
            experienceBackground?: ExperienceBackground;
            bundleId?: string | null;
            recipientGender?: "Girl" | "Boy" | "Neutral" | "";
          }
        | Block[];
      const blocks = Array.isArray(parsed) ? parsed : parsed.blocks;
      if (!Array.isArray(blocks)) throw new Error("Missing draft blocks");
      setSelected(blocks);
      if (!Array.isArray(parsed)) {
        if (parsed.soundtrack) setSoundtrack(parsed.soundtrack);
        setExperienceBackground(
          parsed.experienceBackground || defaultExperienceBackground,
        );
        setSelectedBundleId(parsed.bundleId || null);
        setRecipientGender(parsed.recipientGender || "");
      } else setSelectedBundleId(null);
      setGiftId(draft.id);
      setSenderName(draft.senderName);
      setName(draft.recipientName);
      setRecipient(
        (["Lover", "Friend", "Parents", "Sibling", "Other"].includes(
          draft.recipientType,
        )
          ? draft.recipientType
          : "Other") as Recipient,
      );
      setOccasion(draft.occasion);
      setTheme(draft.theme);
      setAmbience(draft.ambience);
      if (draft.scheduledAt) {
        const date = new Date(draft.scheduledAt);
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60_000,
        );
        setRevealAt(localDate.toISOString().slice(0, 16));
      } else setRevealAt("");
      setActive(0);
      setSaveState("saved");
      setScreen("builder");
    } catch {
      setSaveState("offline");
    }
  }

  async function saveDraft(): Promise<string | null> {
    setSaveState("saving");
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const body = {
        title: `${occasion} for ${name}`,
        senderName: senderName.trim() || "Someone special",
        recipientName: name,
        recipientType: recipient,
        occasion,
        theme,
        ambience,
        blocksJson: JSON.stringify({
          version: 3,
          blocks: selected,
          soundtrack,
          experienceBackground,
          bundleId: selectedBundleId,
          recipientGender,
        }),
        scheduledAt: revealAt ? new Date(revealAt).toISOString() : null,
        compatibilityPin: compatibilityPin || null,
        accessPin: accessPin || null,
        maxOpenCount,
      };
      const response = await fetch(
        `${api}/api/gifts${giftId ? `/${giftId}` : ""}`,
        {
          method: giftId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await authHeaders()),
          },
          body: JSON.stringify(body),
        },
      );
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

  function requestSignIn(action: "save" | "checkout" | null) {
    setAfterAuth(action);
    setAuthOpen(true);
  }

  async function completeSignIn(user: { email: string | null }) {
    const api =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://backend-production-22bd.up.railway.app";
    const response = await fetch(`${api}/api/auth/session`, {
      method: "POST",
      headers: await authHeaders(),
    });
    if (!response.ok) throw new Error("Session could not be created");
    setSignedIn(true);
    setAuthOpen(false);
    const email = user.email?.trim().toLowerCase();
    if (email && ROOT_ADMIN_EMAILS.has(email)) {
      window.location.assign(`${window.location.origin}/?admin=true`);
      return;
    }
    if (afterAuth === "save") window.setTimeout(() => void saveDraft(), 0);
    if (afterAuth === "checkout")
      window.setTimeout(() => setScreen("checkout"), 0);
    setAfterAuth(null);
  }

  async function finishSignIn(provider: "google" | "apple") {
    setAuthError("");
    try {
      const user = await signInWithFirebase(provider);
      await completeSignIn(user);
    } catch {
      setAuthError(
        provider === "apple"
          ? "Apple sign-in needs the Apple Developer credentials to be enabled. Please use Google for now."
          : "Google sign-in did not finish. Please allow the popup and try again.",
      );
    }
  }

  async function finishEmailAuth(
    mode: "login" | "signup",
    email: string,
    password: string,
  ) {
    setAuthError("");
    try {
      if (process.env.NEXT_PUBLIC_E2E_MODE === "true") {
        await completeSignIn({ email });
        return;
      }
      const user = await authenticateWithEmail(email, password, mode);
      await completeSignIn(user);
    } catch (error) {
      const code = (error as { code?: string }).code || "";
      if (code.includes("email-already-in-use"))
        setAuthError(
          "That email already has an account. Choose Log in instead.",
        );
      else if (code.includes("invalid-email"))
        setAuthError("Enter a valid email address.");
      else if (code.includes("weak-password"))
        setAuthError("Use a password with at least 8 characters.");
      else if (
        code.includes("invalid-credential") ||
        code.includes("wrong-password") ||
        code.includes("user-not-found")
      )
        setAuthError("The email or password is incorrect.");
      else
        setAuthError(
          mode === "signup"
            ? "The account could not be created. Please try again."
            : "Email login did not finish. Please try again.",
        );
    }
  }

  async function logout() {
    await signOutFirebase();
    setSignedIn(false);
    setAccountProfile(null);
    setGiftId(null);
    setSaveState("idle");
  }

  async function createPaymentOrder(
    coupon: string,
  ): Promise<PaymentOrder | null> {
    const id = await saveDraft();
    if (!id) return null;
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({ giftId: id, couponCode: coupon }),
      });
      if (!response.ok) throw new Error();
      return (await response.json()) as PaymentOrder;
    } catch {
      setSaveState("offline");
      return null;
    }
  }

  async function verifyPayment(orderId: string, result: RazorpayResult) {
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/orders/${orderId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        }),
      });
      if (!response.ok) throw new Error();
      const paid = await response.json();
      return `${window.location.origin}/?gift=${paid.shareToken}`;
    } catch {
      return null;
    }
  }

  async function completeDemoPayment(orderId: string) {
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(
        `${api}/api/orders/${orderId}/demo-complete`,
        { method: "POST", headers: await authHeaders() },
      );
      if (!response.ok) throw new Error();
      const paid = await response.json();
      return `${window.location.origin}/?gift=${paid.shareToken}`;
    } catch {
      return null;
    }
  }

  async function completeFreeCheckout(orderId: string) {
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(
        `${api}/api/orders/${orderId}/free-complete`,
        { method: "POST", headers: await authHeaders() },
      );
      if (!response.ok) throw new Error();
      const completed = await response.json();
      return `${window.location.origin}/?gift=${completed.shareToken}`;
    } catch {
      return null;
    }
  }

  async function quoteCoupon(coupon: string) {
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/orders/coupon-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          couponCode: coupon,
          subtotalPaise: subtotal * 100,
        }),
      });
      if (!response.ok) {
        const problem = (await response.json().catch(() => null)) as {
          detail?: string;
          message?: string;
        } | null;
        throw new Error(
          problem?.detail ||
            problem?.message ||
            "This coupon could not be applied.",
        );
      }
      return (await response.json()) as {
        couponCode: string;
        subtotalPaise: number;
        discountPaise: number;
        totalPaise: number;
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("This coupon could not be applied. Please try again.");
    }
  }

  function celebrateOccasion(type: string) {
    playSound("celebration");
    setOccasionFx(null);
    window.requestAnimationFrame(() => setOccasionFx(type));
    window.setTimeout(() => setOccasionFx(null), 3200);
  }

  if (!browserReady) return <main className="contribution-loading">♡</main>;
  if (adminMode)
    return (
      <AdminPanel
        onExit={() => window.location.assign(window.location.origin)}
      />
    );
  if (contributionGiftId)
    return <GroupContributionPage inviteToken={contributionGiftId} />;
  if (publicGiftToken) return <PublicGiftExperience token={publicGiftToken} />;

  const signInPopup = authOpen ? (
    <SignInPopup
      onClose={() => setAuthOpen(false)}
      onSignIn={finishSignIn}
      onEmailAuth={finishEmailAuth}
      error={authError}
    />
  ) : null;

  if (screen === "welcome") {
    return (
      <main className="welcome-page">
        {signInPopup}
        <div className="landing-motion" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>♡</span>
          <span>✦</span>
          <span>✿</span>
        </div>
        {occasionFx && (
          <div className={`occasion-fx fx-${occasionFx}`} aria-live="polite">
            <div className="fx-icons">
              {occasionFx === "birthday" ? (
                <>
                  <i>🎈</i>
                  <i>🎂</i>
                  <i>🎉</i>
                  <i>🎈</i>
                  <i>✨</i>
                </>
              ) : occasionFx === "anniversary" ? (
                <>
                  <i>♡</i>
                  <i>💐</i>
                  <i>💍</i>
                  <i>♡</i>
                  <i>✨</i>
                </>
              ) : occasionFx === "friendship" ? (
                <>
                  <i>🎊</i>
                  <i>📸</i>
                  <i>🥳</i>
                  <i>🎊</i>
                  <i>⭐</i>
                </>
              ) : (
                <>
                  <i>🌸</i>
                  <i>💌</i>
                  <i>✨</i>
                  <i>🌷</i>
                  <i>♡</i>
                </>
              )}
            </div>
            <strong>
              {occasionFx === "birthday"
                ? "Make their birthday pop!"
                : occasionFx === "anniversary"
                  ? "Celebrate every chapter."
                  : occasionFx === "friendship"
                    ? "For your favourite chaos."
                    : "Because ordinary days deserve magic."}
            </strong>
          </div>
        )}
        <nav className="nav">
          <button className="brand" onClick={() => setScreen("welcome")}>
            <img
              className="brand-logo-mark"
              src="/mypookie-logo-mark.svg"
              alt=""
            />{" "}
            mypookie.
          </button>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#ideas">Gift ideas</a>
            <a className="nav-celebrations" href="/celebrations">
              Celebrations <span>new</span>
            </a>
            <a href="/invitations">Invitations</a>
            <a href="/careers">Careers</a>
            <a href="#pricing">Pricing</a>
          </div>
          <AccountMenu
            signedIn={signedIn}
            profile={accountProfile}
            isAdmin={ROOT_ADMIN_EMAILS.has(
              accountProfile?.email.trim().toLowerCase() || "",
            )}
            onSignIn={() => requestSignIn(null)}
            onLogout={logout}
            onCreate={() => setScreen("catalog")}
            onAdmin={() =>
              window.location.assign(`${window.location.origin}/?admin=true`)
            }
            onOpenDraft={openSavedDraft}
          />
        </nav>
        <section className="hero">
          <div className="hero-copy">
            <div className="pill">
              <i /> Made for the people you love
            </div>
            <h1>
              A gift they don’t just open. <em>They experience it.</em>
            </h1>
            <p>
              Build a little world of messages, memories, games and
              surprises—personalized by you, opened by them.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setScreen("catalog")}>
                Create a gift <span>→</span>
              </button>
              <button className="text-button" onClick={launchDemoGift}>
                <span className="play">▶</span> Experience a sample gift
              </button>
            </div>
            <div className="social-proof">
              <div className="faces">
                <b>😊</b>
                <b>🥰</b>
                <b>🤍</b>
                <b>✨</b>
              </div>
              <span>
                <strong>4,800+ moments</strong>
                <br />
                made unforgettable
              </span>
            </div>
          </div>
          <div className="hero-art">
            <img
              className="home-keepsake-art"
              src="/home/keepsake-hero.png"
              alt="A personalized gift made from photos, flowers, a letter and a phone"
            />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className={`phone phone-stage-${heroStage}`}>
              <div className="phone-top">
                <span>{currentTime}</span>
                <i />
                <b>●　⌁</b>
              </div>
              <div className="phone-scene">
                <div className="mini-petals">✿　·　✿</div>
                <small>A LITTLE SOMETHING FOR</small>
                <h3>Ananya</h3>
                <div className="phone-envelope">
                  <div className="phone-card-wrap">
                    <button
                      className="phone-letter-card"
                      onClick={(event) => {
                        event.stopPropagation();
                        playSound("page");
                        if (heroStage === "open") setHeroStage("flipped");
                        else if (heroStage === "flipped") setHeroStage("open");
                      }}
                      aria-label={
                        heroStage === "flipped"
                          ? "Show letter message"
                          : "Flip letter to reveal photo"
                      }
                    >
                      <span className="phone-letter-front">
                        You make every day
                        <br />
                        brighter ♡<small>tap the letter</small>
                      </span>
                      <span className="phone-letter-back">
                        <img
                          src="/mypookie-letter-photo.png"
                          alt="A happy memory at the fair"
                        />
                        <small>one of my favourite memories</small>
                      </span>
                    </button>
                  </div>
                  <div className="phone-envelope-back" />
                  <div className="phone-envelope-front" />
                  <div className="phone-envelope-flap" />
                  <b className="phone-wax">♥</b>
                </div>
                <button
                  className="phone-open-action"
                  onClick={() => {
                    playSound(heroStage === "closed" ? "envelope" : "page");
                    setHeroStage(heroStage === "closed" ? "open" : "closed");
                  }}
                >
                  {heroStage === "closed"
                    ? "Open your surprise"
                    : "Close surprise"}
                </button>
              </div>
            </div>
            <div className="float-card card-memory">
              <span>⌁</span>
              <div>
                <small>MEMORY LANE</small>
                <strong>Our first adventure</strong>
              </div>
            </div>
            <div className="float-card card-quiz">
              <span>♡</span>
              <div>
                <small>PERFECT MATCH</small>
                <strong>92% compatible</strong>
              </div>
            </div>
            <div className="float-card card-gift">
              <span>♢</span>
              <div>
                <small>ONE MORE THING</small>
                <strong>A surprise awaits</strong>
              </div>
            </div>
            <div className="home-made-note">
              <small>MADE FROM YOUR MEMORIES</small>
              <strong>not picked from a shelf</strong>
            </div>
          </div>
        </section>
        <section className="home-invitations-spotlight">
          <div>
            <span>NEW · MYPOOKIE INVITATIONS</span>
            <h2>
              Not just gifts. Invite everyone to the big moments, beautifully.
            </h2>
            <p>
              Create one shareable invitation for a wedding, engagement,
              celebration or an event entirely your own—with every ceremony,
              date, venue and photo together.
            </p>
            <a href="/invitations">
              Explore invitations <b>→</b>
            </a>
          </div>
          <div className="home-invite-mini-cards" aria-hidden="true">
            <i>शुभ</i>
            <i>♡</i>
            <i>✦</i>
          </div>
        </section>
        <section
          className="occasion-strip"
          aria-label="Preview gifts by occasion"
        >
          <div>
            <small>SEE THE MAGIC FOR</small>
            <strong>What are you celebrating?</strong>
          </div>
          {[
            ["birthday", "Birthday"],
            ["anniversary", "Anniversary"],
            ["friendship", "Friendship"],
            ["just-because", "Just because"],
          ].map(([id, label], index) => (
            <button key={id} onClick={() => celebrateOccasion(id)}>
              <i
                style={{
                  backgroundImage: "url('/mypookie-occasions.png')",
                  backgroundPosition: `${index * 33.333}% center`,
                }}
              />
              <span>{label}</span>
              <b>Try it →</b>
            </button>
          ))}
        </section>
        <section className="home-celebrations" id="celebrations">
          <div className="home-celebrations-copy">
            <div className="section-kicker">CELEBRATIONS, MADE PERSONAL</div>
            <h2>
              Every date has a story.
              <br />
              <em>Make yours unforgettable.</em>
            </h2>
            <p>
              Start with a beautifully designed occasion, then fill it with the
              tiny things only the two of you understand.
            </p>
            <div className="home-celebration-chips">
              <span>Birthdays</span>
              <span>Anniversaries</span>
              <span>Friendship</span>
              <span>Festivals</span>
            </div>
            <a className="home-celebration-cta" href="/celebrations">
              Explore celebrations <b>→</b>
            </a>
          </div>
          <div className="home-celebrations-art">
            <div className="home-art-halo" />
            <img
              src="/home/celebration-postcards.png"
              alt="Illustrated postcards for birthdays, anniversaries, Raksha Bandhan and friendship"
            />
            <a
              className="festival-float-card"
              href="/celebrations/rakhi-bhai-dooj"
            >
              <span>✦ FESTIVAL SPOTLIGHT</span>
              <strong>
                Raksha Bandhan
                <br />& Bhai Dooj
              </strong>
              <small>Explore the sibling theme →</small>
            </a>
          </div>
        </section>
        <section
          className="home-feeling-strip"
          aria-label="Ways to make a gift feel personal"
        >
          <article>
            <i>✉</i>
            <div>
              <small>SAY IT BEAUTIFULLY</small>
              <strong>Letters that unfold</strong>
              <p>Write what a store-bought card never could.</p>
            </div>
          </article>
          <article>
            <i>▦</i>
            <div>
              <small>MAKE IT PLAYFUL</small>
              <strong>Memories they unlock</strong>
              <p>Photos become puzzles, games and tiny reveals.</p>
            </div>
          </article>
          <article>
            <i>♫</i>
            <div>
              <small>SET THE MOOD</small>
              <strong>A world that sounds like you</strong>
              <p>Add the song that belongs to your story.</p>
            </div>
          </article>
        </section>
        <LandingShowcase />
        <section className="how" id="how">
          <div className="section-kicker">HOW IT WORKS</div>
          <h2>
            Made by you. <em>Magic for them.</em>
          </h2>
          <div className="steps">
            <article>
              <b>01</b>
              <span>♡</span>
              <h3>Choose your person</h3>
              <p>Tell us who you’re celebrating and why.</p>
            </article>
            <article>
              <b>02</b>
              <span>▦</span>
              <h3>Build their experience</h3>
              <p>Start with a bundle or choose every activity yourself.</p>
            </article>
            <article>
              <b>03</b>
              <span>✦</span>
              <h3>Send a little magic</h3>
              <p>Preview, schedule and share one beautiful private link.</p>
            </article>
          </div>
        </section>
        <footer className="site-footer">
          <a className="brand" href="/">
            <img
              className="brand-logo-mark"
              src="/mypookie-logo-mark.svg"
              alt=""
            />{" "}
            mypookie.
          </a>
          <p>Private little worlds, made for the people who matter.</p>
          <div>
            <a href="/terms">Terms & Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/refund-policy">Refund / Cancellation</a>
            <a href="/contact">Contact Us</a>
            <a href="https://www.mypookie.store/careers">Careers</a>
            <a href="/invitations">Wedding Invitations</a>
            <a href="/celebrations">Celebrations</a>
          </div>
          <small>
            © 2026 mypookie. · Personalized digital purchases are non-refundable
            except where required by law or covered by our refund policy.
          </small>
        </footer>
      </main>
    );
  }

  if (screen === "catalog") {
    return (
      <main className="product-page">
        {signInPopup}
        <header className="nav catalog-nav">
          <button className="brand" onClick={() => setScreen("welcome")}>
            <img
              className="brand-logo-mark"
              src="/mypookie-logo-mark.svg"
              alt=""
            />{" "}
            mypookie.
          </button>
          <div className="nav-links">
            <a href="/#how">How it works</a>
            <a href="/#ideas">Gift ideas</a>
            <a href="/invitations">Invitations</a>
            <a href="/careers">Careers</a>
            <a href="/#pricing">Pricing</a>
          </div>
          <AccountMenu
            signedIn={signedIn}
            profile={accountProfile}
            isAdmin={ROOT_ADMIN_EMAILS.has(
              accountProfile?.email.trim().toLowerCase() || "",
            )}
            onSignIn={() => requestSignIn(null)}
            onLogout={logout}
            onCreate={() => {
              setSelected([]);
              setSelectedBundleId(null);
              setGiftId(null);
              setScreen("builder");
            }}
            onAdmin={() =>
              window.location.assign(`${window.location.origin}/?admin=true`)
            }
            onOpenDraft={openSavedDraft}
          />
        </header>
        <section className="catalog-intro">
          <button className="back" onClick={() => setScreen("welcome")}>
            ← Back
          </button>
          <div className="section-kicker">LET’S MAKE SOMETHING BEAUTIFUL</div>
          <h1>Who is this little world for?</h1>
          <p>
            We’ll personalize the ideas, wording and themes around your
            relationship.
          </p>
          <div className="recipient-row">
            {recipients.map((r) => (
              <button
                key={r}
                className={recipient === r ? "active" : ""}
                onClick={() => setRecipient(r)}
              >
                <span>
                  {r === "Lover"
                    ? "♡"
                    : r === "Friend"
                      ? "☺"
                      : r === "Parents"
                        ? "⌂"
                        : r === "Sibling"
                          ? "✦"
                          : "+"}
                </span>
                <strong>{r}</strong>
                <small>
                  {r === "Lover"
                    ? "romantic & close"
                    : r === "Friend"
                      ? "joyful & nostalgic"
                      : r === "Parents"
                        ? "warm & grateful"
                        : r === "Sibling"
                          ? "playful & personal"
                          : "make it your own"}
                </small>
              </button>
            ))}
          </div>
          <div className="quick-fields three-fields">
            <label>
              Your name
              <input
                maxLength={80}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Who is sending this?"
              />
            </label>
            <label>
              Their name
              <input
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              They are
              <select
                value={recipientGender}
                onChange={(e) =>
                  setRecipientGender(
                    e.target.value as "Girl" | "Boy" | "Neutral" | "",
                  )
                }
              >
                <option value="">Choose</option>
                <option value="Girl">A girl</option>
                <option value="Boy">A boy</option>
                <option value="Neutral">Use neutral pronouns</option>
              </select>
            </label>
            <label>
              Occasion
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              >
                <option>Just because</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>I’m sorry</option>
                <option>Congratulations</option>
                <option>Raksha Bandhan</option>
                <option>Bhai Dooj</option>
              </select>
            </label>
          </div>
          <aside
            className="catalog-story-preview"
            aria-label="Your gift story preview"
          >
            <div className="catalog-preview-orbit" />
            <span className="catalog-preview-number">01</span>
            <small>A LITTLE WORLD FOR</small>
            <h2>{name || "Someone special"}</h2>
            <img
              src="/letters/envelopes/blush-botanical.webp"
              alt="A handmade sealed envelope"
            />
            <div>
              <b>{recipient}</b>
              <span>·</span>
              <b>{occasion}</b>
            </div>
            <p>Letters, memories, games and one beautiful final surprise.</p>
            <div className="catalog-preview-build">
              <small>MAKE IT ENTIRELY YOURS</small>
              <button
                className="scratch-link"
                onClick={() => {
                  setSelected([]);
                  setSelectedBundleId(null);
                  setScreen("builder");
                }}
              >
                <b>＋</b> Build from scratch <span>→</span>
              </button>
            </div>
          </aside>
        </section>
        <section className="creation-choice">
          <div className="choice-heading">
            <div>
              <div className="section-kicker">
                CHOSEN FOR {recipient.toUpperCase()}
              </div>
              <h2>
                {recipient === "Lover"
                  ? "Made for the two of you"
                  : recipient === "Friend"
                    ? "For the friend who knows everything"
                    : recipient === "Parents"
                      ? "Stories made for family"
                      : recipient === "Sibling"
                        ? "For your original partner in chaos"
                        : "A beautiful fit for anyone special"}
              </h2>
              <p>
                Each bundle has a different mood and can still be completely
                customized.
              </p>
            </div>
          </div>
          <div className="bundle-grid">
            {visibleBundles.map((b, index) => (
              <article className={`bundle bundle-${index}`} key={b.id}>
                <div className="bundle-art">
                  <b className="bundle-number">0{index + 1}</b>
                  <small>{b.ids.length} MOMENTS</small>
                  <img
                    className="bundle-cover"
                    src={
                      index === 0
                        ? "/letters/envelopes/blush-botanical.webp"
                        : index === 1
                          ? "/letters/envelopes/kraft-keepsake.webp"
                          : "/letters/envelopes/midnight-velvet.webp"
                    }
                    alt=""
                  />
                  <span>
                    {index === 0
                      ? recipient === "Parents"
                        ? "⌂"
                        : "♡"
                      : index === 1
                        ? "✦"
                        : recipient === "Friend" || recipient === "Sibling"
                          ? "☺"
                          : "♢"}
                  </span>
                  <div className="bundle-pages">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="bundle-content">
                  <div className="bundle-audience">
                    <small>{b.badge}</small>
                    <span>For {b.recipientType.toLowerCase()}</span>
                  </div>
                  <h3>{b.name}</h3>
                  <p>{b.copy}</p>
                  <div className="bundle-includes">
                    {b.ids.slice(0, 4).map((id) => (
                      <span key={id}>
                        {catalogActivities.find((a) => a.id === id)?.icon}
                      </span>
                    ))}
                    <b>+{b.ids.length - 4}</b>
                  </div>
                  <div className="bundle-bottom">
                    <strong>₹{b.price}</strong>
                    <button onClick={() => chooseBundle(b.ids, b.id)}>
                      Choose bundle →
                    </button>
                  </div>
                  <em>Everything can be changed</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (screen === "checkout") {
    return (
      <>
        {signInPopup}
        <CheckoutPage
          blocks={selected}
          senderName={senderName.trim() || "Someone special"}
          name={name}
          occasion={occasion}
          subtotal={subtotal}
          revealAt={revealAt}
          onRevealAt={setRevealAt}
          compatibilityPin={compatibilityPin}
          onCompatibilityPin={setCompatibilityPin}
          accessPin={accessPin}
          onAccessPin={setAccessPin}
          maxOpenCount={maxOpenCount}
          onMaxOpenCount={setMaxOpenCount}
          onBack={() => setScreen("builder")}
          onQuote={quoteCoupon}
          onCreateOrder={createPaymentOrder}
          onVerifyPayment={verifyPayment}
          onFreeComplete={completeFreeCheckout}
          onDemoComplete={completeDemoPayment}
        />
      </>
    );
  }

  if (screen === "preview") {
    const item = selected[previewStep];
    const effectBlock = selected.find((block) => block.id === "flowers");
    const effectConfig = effectBlock?.config || {};
    const effectSymbols: Record<string, string[]> = {
      "Rose garden": ["❀", "✦", "·"],
      "Golden fireworks": ["✦", "✧", "•"],
      "Birthday glow": ["○", "✦", "⌁"],
      "Winter lights": ["❅", "✦", "·"],
      "Floating hearts": ["♡", "♥", "·"],
      Starlight: ["✦", "✧", "⋆"],
    };
    const showEffect =
      Boolean(effectBlock) &&
      (effectConfig.timing === "Entire show" ||
        (effectConfig.timing === "Only on this block" &&
          item?.id === "flowers") ||
        (effectConfig.timing === "After winning or interacting" && opened) ||
        (effectConfig.timing === "At the end" &&
          previewStep === selected.length - 1));
    const currentComplete = completedSteps.includes(previewStep);
    function completeMoment() {
      setCompletedSteps((current) =>
        current.includes(previewStep) ? current : [...current, previewStep],
      );
    }
    function advancePreviewMoment() {
      if (previewStep < selected.length - 1) {
        setPreviewStep(previewStep + 1);
        setOpened(false);
      } else {
        setPreviewStep(0);
        setOpened(false);
        setCompletedSteps([]);
        setWonItems([]);
      }
    }
    function addReward(reward: string) {
      rewardCounter.current += 1;
      setWonItems((current) => [
        ...current,
        {
          id: rewardCounter.current,
          source: item?.name || "A surprise",
          reward,
        },
      ]);
      setWinsOpen(true);
    }
    return (
      <main
        className={`recipient-preview theme-${theme.toLowerCase().replaceAll(" ", "-")}`}
        style={experienceBackgroundStyle(experienceBackground)}
      >
        {showEffect && (
          <div
            className={`recipient-effect-overlay effect-${(effectConfig.intensity || "Lush").toLowerCase()}`}
            aria-hidden="true"
          >
            {Array.from({ length: 28 }, (_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${(index % 9) * -0.32}s`,
                }}
              >
                {
                  (effectSymbols[effectConfig.effect] ||
                    effectSymbols["Rose garden"])[index % 3]
                }
              </i>
            ))}
          </div>
        )}
        <button
          className="exit-preview"
          onClick={() => setScreen(previewOrigin)}
        >
          ← {previewOrigin === "welcome" ? "Back to home" : "Back to builder"}
        </button>
        <GiftSoundtrack
          settings={soundtrack}
          blocks={selected}
          step={previewStep}
        />
        <WinningTray
          items={wonItems}
          open={winsOpen}
          onToggle={() => setWinsOpen((value) => !value)}
        />
        <div className="recipient-experience-shell">
          <div className="preview-count">
            {previewStep + 1} of {selected.length}
          </div>
          {!item ? (
            <div className="preview-empty">
              <div className="big-symbol">♡</div>
              <h1>Your gift needs a little magic</h1>
              <p>Add an activity in the builder to begin.</p>
            </div>
          ) : (
            <BuilderLivePreview
              key={`${item.instanceId || item.id}-${previewStep}`}
              block={item}
              name={name}
              senderName={senderName.trim() || "Someone special"}
              theme={theme}
              ambience={ambience}
              giftId={giftId || undefined}
              onInteract={() => setOpened(true)}
              onComplete={completeMoment}
              onAdvance={advancePreviewMoment}
              onReward={addReward}
            />
          )}
          {item && (
            <div className="recipient-progress-gate">
              <button
                className="primary recipient-next"
                disabled={!currentComplete}
                onClick={advancePreviewMoment}
              >
                {previewStep < selected.length - 1
                  ? "Continue to the next moment"
                  : "Experience it again"}{" "}
                <span>→</span>
              </button>
              {!currentComplete && (
                <small>Complete this moment to unlock the next one</small>
              )}
              {currentComplete && (
                <small className="ready">Moment complete ✓</small>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      className={`builder-page ${mobileCustomizerOpen ? "mobile-customizer-open" : ""}`}
    >
      {signInPopup}
      <header className="app-header builder-header">
        <div className="builder-brand-row">
          <button
            className="editor-back"
            onClick={() => setScreen("catalog")}
            aria-label="Go back to gift choices"
          >
            ← <span>Back</span>
          </button>
          <button className="brand" onClick={() => setScreen("welcome")}>
            <img
              className="brand-logo-mark"
              src="/mypookie-logo-mark.svg"
              alt=""
            />{" "}
            mypookie.
          </button>
        </div>
        <div className="gift-title">
          <small>CREATING FOR</small>
          <strong>
            {name || "Someone special"} <i>♡</i>
          </strong>
        </div>
        <div className="header-actions">
          <button
            className={`global-soundtrack-button ${soundtrack.enabled ? "active" : ""}`}
            onClick={() => setSoundtrackOpen(true)}
          >
            ♫ Soundtrack <span>{soundtrack.enabled ? "ON" : "OFF"}</span>
          </button>
          <button
            className="quiet"
            onClick={() =>
              signedIn ? void saveDraft() : requestSignIn("save")
            }
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved ✓"
                : saveState === "offline"
                  ? "Backend offline · Retry"
                  : "Save draft"}
          </button>
          <button className="preview-button" onClick={launchPreview}>
            Preview gift <span>▶</span>
          </button>
        </div>
      </header>
      {soundtrackOpen && (
        <div
          className="global-soundtrack-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSoundtrackOpen(false)
          }
        >
          <section
            className="global-soundtrack-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Gift soundtrack"
          >
            <header>
              <div>
                <small>ONE SOUNDTRACK · THE WHOLE GIFT</small>
                <h2>Set the mood</h2>
              </div>
              <button
                onClick={() => setSoundtrackOpen(false)}
                aria-label="Close soundtrack"
              >
                ×
              </button>
            </header>
            <SoundtrackEditor
              settings={soundtrack}
              blocks={selected}
              onChange={(patch) =>
                setSoundtrack((current) => ({ ...current, ...patch }))
              }
            />
          </section>
        </div>
      )}
      <div className="builder-shell">
        <aside className="library">
          <div className="library-head">
            <div>
              <div className="section-kicker">ACTIVITY LIBRARY</div>
              <h2>Add a little magic</h2>
            </div>
            <span>{catalogActivities.length}</span>
          </div>
          <p>Choose a block to add it and try it live in the centre.</p>
          <div className="activity-categories">
            {(
              [
                "Messages & media",
                "Memories",
                "Playful games",
                "Sentimental stories",
                "Celebrations & gifts",
                "Plans & together",
              ] as const
            ).map((category) => (
              <section className="activity-category" key={category}>
                <header>
                  <strong>{category}</strong>
                  <span>
                    {
                      catalogActivities.filter(
                        (item) => item.category === category,
                      ).length
                    }
                  </span>
                </header>
                <div className="activity-list">
                  {catalogActivities
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const selectedIndex = selected.findIndex(
                        (x) => x.id === item.id,
                      );
                      const isSelected = selectedIndex >= 0;
                      const isActive = isSelected && active === selectedIndex;
                      const isMobilePreview =
                        isActive || libraryPreview?.id === item.id;
                      const previewBlock = isSelected
                        ? selected[selectedIndex]
                        : {
                            ...item,
                            config: { ...(blockDefaults[item.id] || {}) },
                          };
                      return (
                        <div className="mobile-activity-group" key={item.id}>
                          <div
                            className={`activity-choice ${isSelected ? "selected" : ""} ${isActive ? "active" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (isSelected) {
                                setLibraryPreview(null);
                                setActive(selectedIndex);
                              } else setLibraryPreview(item);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                if (isSelected) {
                                  setLibraryPreview(null);
                                  setActive(selectedIndex);
                                } else setLibraryPreview(item);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                setActivitySelected(item, event.target.checked)
                              }
                              aria-label={`${isSelected ? "Remove" : "Add"} ${item.name}`}
                            />
                            <span
                              className="activity-check"
                              role="checkbox"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setActivitySelected(item, !isSelected);
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setActivitySelected(item, !isSelected);
                                }
                              }}
                            >
                              {isSelected ? "✓" : ""}
                            </span>
                            <i className={item.color}>{item.icon}</i>
                            <span className="activity-copy">
                              <strong>{item.name}</strong>
                              <small>{item.description}</small>
                            </span>
                            <b>
                              {isActive
                                ? "LIVE"
                                : isSelected
                                  ? "SELECTED"
                                  : `₹${item.price}`}
                            </b>
                          </div>
                          {isMobilePreview && (
                            <section
                              className="mobile-inline-preview"
                              aria-label={`${item.name} live preview`}
                            >
                              <header>
                                <div>
                                  <small>
                                    {isSelected
                                      ? "ADDED TO YOUR GIFT"
                                      : "TRY IT FIRST"}
                                  </small>
                                  <strong>{item.name}</strong>
                                </div>
                                <span>
                                  <i /> Live
                                </span>
                              </header>
                              <div className="mobile-preview-canvas">
                                <BuilderLivePreview
                                  key={`mobile-${previewBlock.instanceId || previewBlock.id}-${builderPreviewNonce}`}
                                  block={previewBlock}
                                  name={name}
                                  senderName={
                                    senderName.trim() || "Someone special"
                                  }
                                  theme={theme}
                                  ambience={ambience}
                                  giftId={giftId || undefined}
                                />
                              </div>
                              <div className="mobile-preview-actions">
                                <button
                                  className="mobile-add-action"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setActivitySelected(item, !isSelected);
                                  }}
                                >
                                  {isSelected
                                    ? "✓ Added"
                                    : `＋ Add for ₹${item.price}`}
                                </button>
                                {isSelected && (
                                  <button
                                    className="mobile-customize-action"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setLibraryPreview(null);
                                      setActive(selectedIndex);
                                      setMobileCustomizerOpen(true);
                                    }}
                                  >
                                    Customize <span>→</span>
                                  </button>
                                )}
                              </div>
                            </section>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </aside>
        <section className="live-editor">
          <div className="live-editor-head">
            <div>
              <div className="section-kicker">LIVE RECIPIENT PREVIEW</div>
              <h2>
                {activeBlock ? activeBlock.name : "Choose a block to begin"}
              </h2>
              <p>
                {activeBlock
                  ? "Play with it here. Changes from the right appear instantly."
                  : "Select any activity from the library and its real interaction will appear here."}
              </p>
            </div>
            {activeBlock && (
              <div className="live-preview-controls">
                <button
                  onClick={() => setBuilderPreviewNonce((value) => value + 1)}
                  aria-label={`Restart ${activeBlock.name}`}
                >
                  ↻ Restart activity
                </button>
                <button
                  onClick={() => setBlockPreviewFullscreen(true)}
                  aria-label={`Preview ${activeBlock.name} full screen`}
                >
                  ⛶ Full screen
                </button>
                <span className="live-badge">
                  <i /> Interactive
                </span>
              </div>
            )}
          </div>
          {activeBlock ? (
            <div
              className={`builder-transition-preview-stage ${blockPreviewFullscreen ? "sender-block-fullscreen" : ""}`}
            >
              {blockPreviewFullscreen && (
                <button
                  className="close-block-fullscreen"
                  onClick={() => setBlockPreviewFullscreen(false)}
                  aria-label="Exit full screen preview"
                >
                  × Exit preview
                </button>
              )}
              {builderTransitionPreview ? (
                <section
                  className={`builder-transition-demo moment-slideshow moment-teaser transition-${(activeBlock.config?.transitionStyle || (transitionGameBlocks.has(activeBlock.id) ? "Soft zoom" : "None")).toLowerCase().replaceAll(" ", "-")}`}
                  style={
                    {
                      "--transition-duration": `${Math.min(2, Math.max(1, Number(activeBlock.config?.transitionDuration) || 1.6))}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className="moment-slide-orbit" aria-hidden="true">
                    <i />
                    <i />
                    <span>{activeBlock.icon}</span>
                  </div>
                  <small>COMING NEXT</small>
                  <h2>{activeBlock.name}</h2>
                  <p>{activeBlock.message}</p>
                  <div className="teaser-progress" aria-hidden="true">
                    <i />
                  </div>
                </section>
              ) : (
                <BuilderLivePreview
                  key={`${activeBlock.instanceId || activeBlock.id}-${builderPreviewNonce}-${activeBlock.id === "matchpair" ? `${activeBlock.config?.matchGrid || "8"}-${activeBlock.config?.pairPhotos || "[]"}` : "stable"}`}
                  block={activeBlock}
                  name={name}
                  senderName={senderName.trim() || "Someone special"}
                  theme={theme}
                  ambience={ambience}
                  giftId={giftId || undefined}
                  onConfig={updateBlockConfig}
                  onAdvance={() => {
                    if (!libraryPreview && active < selected.length - 1) {
                      setActive(active + 1);
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <div className="empty-live-preview">
              <div className="empty-live-orbit">
                <span>✦</span>
                <i>♡</i>
                <b>✿</b>
              </div>
              <h3>Your live preview will appear here</h3>
              <p>
                Try the letter, wheel, puzzle, quiz and every other block before
                sending it.
              </p>
              <button
                onClick={() =>
                  selectActivity(catalogActivities[0] || activities[0])
                }
              >
                Start with a personal letter →
              </button>
            </div>
          )}
        </section>
        <aside className="customizer">
          <div className="customizer-head">
            <div className="section-kicker">CUSTOMIZE</div>
            <span>
              {selected.length ? `${active + 1} / ${selected.length}` : "0 / 0"}
            </span>
            <button
              className="mobile-customizer-close"
              onClick={() => setMobileCustomizerOpen(false)}
              aria-label="Close customization"
            >
              ×
            </button>
          </div>
          {!activeBlock || libraryPreview ? (
            <div className="custom-empty">
              <span>✎</span>
              <h3>{libraryPreview ? "Preview only" : "Select an activity"}</h3>
              <p>
                {libraryPreview
                  ? "Use the checkbox in the library to add this activity before customizing it."
                  : "Choose a moment to personalize its words, behaviour and style."}
              </p>
            </div>
          ) : (
            <>
              <div className="current-block">
                <i className={activeBlock.color}>{activeBlock.icon}</i>
                <div>
                  <small>MOMENT {active + 1}</small>
                  <h2>{activeBlock.name}</h2>
                </div>
              </div>
              <PlayfulAiAssistant
                id={activeBlock.id}
                relationship={`${senderName.trim() || "the sender"} and ${name || "the recipient"} are ${recipient.toLowerCase()}s celebrating ${occasion.toLowerCase()}`}
                config={activeBlock.config || {}}
                onConfig={updateBlockConfig}
              />
              <BlockCustomization
                key={activeBlock.instanceId || activeBlock.id}
                block={activeBlock}
                giftId={giftId || undefined}
                onMessage={updateMessage}
                onConfig={updateBlockConfig}
              />
              <GifDecorationEditor config={activeBlock.config || {}} onConfig={updateBlockConfig} />
              <div className="style-row">
                <label className="field">
                  Theme
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option>Blush romance</option>
                    <option>Golden celebration</option>
                    <option>Midnight magic</option>
                  </select>
                </label>
                <label className="field">
                  Ambience
                  <select
                    value={ambience}
                    onChange={(e) => setAmbience(e.target.value)}
                  >
                    <option>Petals</option>
                    <option>Soft sparkles</option>
                    <option>None</option>
                  </select>
                </label>
              </div>
              <div className="customizer-live-note">
                <i /> You’re editing the live preview
              </div>
              <div className="next-row">
                <button
                  disabled={active === 0}
                  onClick={() => setActive(active - 1)}
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setActive(Math.min(active + 1, selected.length - 1))
                  }
                >
                  {active === selected.length - 1
                    ? "Finish customization"
                    : "Save & customize next"}{" "}
                  <span>→</span>
                </button>
              </div>
              <div className="block-instance-actions">
                <button
                  className="duplicate-block"
                  onClick={duplicateActiveBlock}
                >
                  ＋ Repeat this block
                </button>
                <button className="remove-block" onClick={removeActiveBlock}>
                  Remove this block
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
      <footer className="checkout-bar sequence-checkout-bar">
        <div className="ribbon-title">
          <small>YOUR GIFT</small>
          <strong>
            {selected.length} moments for {name}
          </strong>
        </div>
        <div className="ribbon-sequence" aria-label="Scrollable gift sequence">
          {selected.map((item, index) => (
            <div
              className={`ribbon-moment ${active === index ? "active" : ""}`}
              key={item.instanceId || `${item.id}-${index}`}
            >
              <button onClick={() => setActive(index)}>
                <i className={item.color}>{item.icon}</i>
                <span>
                  <small>{index + 1}</small>
                  {item.name}
                </span>
              </button>
              <div>
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${item.name} earlier`}
                >
                  ←
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  aria-label={`Move ${item.name} later`}
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="ribbon-checkout">
          <div className="price">
            <span>Live total</span>
            <strong>₹{subtotal}</strong>
          </div>
          <button
            disabled={!selected.length}
            onClick={() =>
              signedIn ? setScreen("checkout") : requestSignIn("checkout")
            }
          >
            Checkout <span>→</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

function SignInPopup({
  onClose,
  onSignIn,
  onEmailAuth,
  error,
}: {
  onClose: () => void;
  onSignIn: (provider: "google" | "apple") => Promise<void>;
  onEmailAuth: (
    mode: "login" | "signup",
    email: string,
    password: string,
  ) => Promise<void>;
  error: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || password.length < 8) return;
    setBusy(true);
    try {
      await onEmailAuth(mode, email, password);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="signin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="signin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
      >
        <button
          className="signin-modal-close"
          onClick={onClose}
          aria-label="Close sign in"
        >
          ×
        </button>
        <div className="signin-modal-brand">
          <span>♥</span> mypookie.
        </div>
        <span className="signin-modal-heart">♡</span>
        <small>KEEP EVERY LITTLE DETAIL SAFE</small>
        <h2 id="signin-title">
          {mode === "login"
            ? "Sign in to keep creating."
            : "Create your mypookie. account."}
        </h2>
        <p>
          Save drafts, return from any device, track recipient answers and see
          every group contribution in one place.
        </p>
        <div className="signin-benefits">
          <span>✓ Drafts stay saved</span>
          <span>✓ Responses are tracked</span>
          <span>✓ Private links stay manageable</span>
        </div>
        <div
          className="email-auth-tabs"
          role="tablist"
          aria-label="Email authentication"
        >
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            role="tab"
            aria-selected={mode === "login"}
          >
            Log in
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            role="tab"
            aria-selected={mode === "signup"}
          >
            Sign up
          </button>
        </div>
        <form className="email-auth-form" onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="At least 8 characters"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy || !email.trim() || password.length < 8}
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Log in with email"
                : "Create account"}
          </button>
        </form>
        <div className="signin-divider">
          <span>or continue with</span>
        </div>
        <button
          className="provider-button google"
          onClick={() => void onSignIn("google")}
        >
          <b>G</b> Continue with Google
        </button>
        {error && <output className="signin-error">{error}</output>}
        <em>Authentication is secured by Firebase. Your gift stays private.</em>
      </section>
    </div>
  );
}

const soundtrackTemplates = [
  {
    id: "until-i-found-you",
    name: "Until I Found You — Stephen Sanchez & Em Beihold",
    mood: "Classic romance · warm duet",
    url: "/api/music/until-i-found-you",
    mark: "♡",
  },
  {
    id: "blue",
    name: "Blue — yung kai",
    mood: "Dreamy · tender",
    url: "/api/music/blue",
    mark: "☾",
  },
  {
    id: "i-think-they-call-this-love",
    name: "I Think They Call This Love",
    mood: "Sweet · timeless romance",
    url: "/api/music/i-think-they-call-this-love",
    mark: "♥",
  },
  {
    id: "somewhere-only-we-know",
    name: "Somewhere Only We Know — Keane",
    mood: "Nostalgic · meaningful",
    url: "/api/music/somewhere-only-we-know",
    mark: "⌂",
  },
  {
    id: "treat-you-better",
    name: "Treat You Better — Shawn Mendes",
    mood: "Pop · heartfelt",
    url: "/api/music/treat-you-better",
    mark: "✦",
  },
  {
    id: "the-night-we-met",
    name: "The Night We Met — Lord Huron",
    mood: "Late night · wistful",
    url: "/api/music/the-night-we-met",
    mark: "☽",
  },
  {
    id: "ive-got-my-eye-on-you",
    name: "I've Got My Eye on You",
    mood: "Intimate · magnetic",
    url: "/api/music/ive-got-my-eye-on-you",
    mark: "◉",
  },
  {
    id: "perfect",
    name: "Perfect — Ed Sheeran",
    mood: "Slow dance · romantic",
    url: "/api/music/perfect",
    mark: "♪",
  },
  {
    id: "i-wanna-be-yours",
    name: "I Wanna Be Yours — Arctic Monkeys",
    mood: "Moody · devoted",
    url: "/api/music/i-wanna-be-yours",
    mark: "∞",
  },
  {
    id: "i-thought-i-saw-your-face-today",
    name: "I Thought I Saw Your Face Today — She & Him",
    mood: "Indie · nostalgic",
    url: "/api/music/i-thought-i-saw-your-face-today",
    mark: "❀",
  },
];

function playableSoundtrackUrl(url: string) {
  const match = url.match(/^\/music\/([^/]+)\.mp3$/);
  return match ? `/api/music/${match[1]}` : url;
}

function SoundtrackEditor({
  settings,
  blocks,
  onChange,
}: {
  settings: SoundtrackSettings;
  blocks: Block[];
  onChange: (patch: Partial<SoundtrackSettings>) => void;
}) {
  const previewRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  useEffect(() => {
    const audio = previewRef.current;
    if (!audio) return;
    const shapePreview = () => {
      const start = Math.max(0, Number(settings.startSeconds) || 0);
      const endValue = Number(settings.endSeconds) || 0;
      const end =
        endValue > start
          ? Math.min(endValue, audio.duration || endValue)
          : audio.duration;
      const fadeIn = settings.fadeIn === false ? 0 : 2;
      const fadeOut = settings.fadeOut === false ? 0 : 2;
      if (Number.isFinite(end) && audio.currentTime >= end) {
        audio.currentTime = start;
        void audio.play().catch(() => {});
      }
      const inGain = fadeIn
        ? Math.min(1, Math.max(0, (audio.currentTime - start) / fadeIn))
        : 1;
      const outGain =
        fadeOut && Number.isFinite(end)
          ? Math.min(1, Math.max(0, (end - audio.currentTime) / fadeOut))
          : 1;
      audio.volume = 0.65 * Math.min(inGain, outGain);
    };
    audio.addEventListener("timeupdate", shapePreview);
    return () => audio.removeEventListener("timeupdate", shapePreview);
  }, [
    settings.startSeconds,
    settings.endSeconds,
    settings.fadeIn,
    settings.fadeOut,
  ]);
  const startBlock =
    settings.startBlockId &&
    blocks.some((block) => block.id === settings.startBlockId)
      ? settings.startBlockId
      : blocks[0]?.id || "";
  function selectAndPreview(template: (typeof soundtrackTemplates)[number]) {
    const audio = previewRef.current;
    if (audio && previewingId === template.id && !audio.paused) {
      audio.pause();
      setPreviewingId(null);
      return;
    }
    const currentTracks = settings.tracks || [];
    const alreadySelected = currentTracks.some(
      (track) => track.id === template.id,
    );
    const selectedTrack = currentTracks.find(
      (track) => track.id === template.id,
    );
    const tracks = settings.allowMultiple
      ? alreadySelected
        ? currentTracks
        : [
            ...currentTracks,
            {
              id: template.id,
              name: template.name,
              url: template.url,
              startSeconds: "0",
              endSeconds: "",
            },
          ]
      : [
          {
            id: template.id,
            name: template.name,
            url: template.url,
            startSeconds: "0",
            endSeconds: "",
          },
        ];
    onChange({
      templateId: template.id,
      audioUrl: template.url,
      name: template.name,
      enabled: true,
      startSeconds: selectedTrack?.startSeconds || "0",
      endSeconds: selectedTrack?.endSeconds || "",
      tracks,
    });
    if (!audio) return;
    setPreviewError("");
    audio.src = playableSoundtrackUrl(template.url);
    audio.load();
    // Start inside the user's click gesture. Waiting for metadata first can
    // make Safari and mobile Chrome treat this as blocked autoplay.
    const playback = audio.play();
    if (playback) void playback.then(() => setPreviewingId(template.id)).catch(() => {
      setPreviewingId(null);
      setPreviewError("Tap once more to preview this song.");
    });
    audio.onloadedmetadata = () => {
      const start = Math.min(
        Math.max(0, Number(settings.startSeconds) || 0),
        Math.max(audio.duration - 0.25, 0),
      );
      audio.currentTime = start;
      setDuration(audio.duration || 0);
    };
  }
  return (
    <div className="soundtrack-editor global">
      <div className="soundtrack-summary">
        <span>♫</span>
        <div>
          <strong>Soothing soundtrack</strong>
          <small>
            {settings.enabled
              ? settings.name
              : "Choose a built-in music template"}
          </small>
        </div>
        <b>{settings.enabled ? "ON" : "OFF"}</b>
      </div>
      <div className="soundtrack-body">
        <audio ref={previewRef} preload="metadata" onEnded={() => setPreviewingId(null)} onPause={() => setPreviewingId(null)} />
        <label className="soundtrack-toggle">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
          <span />
          <div>
            <strong>Play background music</strong>
            <small>The recipient can always pause or mute it.</small>
          </div>
        </label>
        <div className="soundtrack-choice-options">
          <label>
            <input
              type="checkbox"
              checked={Boolean(settings.allowMultiple)}
              onChange={(event) =>
                onChange({
                  allowMultiple: event.target.checked,
                  tracks: event.target.checked
                    ? settings.tracks || [
                        {
                          id: settings.templateId || "soundtrack",
                          name: settings.name,
                          url: settings.audioUrl,
                        },
                      ]
                    : [
                        (settings.tracks || [])[0] || {
                          id: settings.templateId || "soundtrack",
                          name: settings.name,
                          url: settings.audioUrl,
                        },
                      ],
                })
              }
            />
            <span>Add multiple songs</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(settings.loop)}
              onChange={(event) => onChange({ loop: event.target.checked })}
            />
            <span>Play on loop</span>
          </label>
        </div>
        <div className="soundtrack-template-grid">
          {soundtrackTemplates.map((template) => (
            <div
              className={`soundtrack-template-card ${(settings.tracks || []).some((track) => track.id === template.id) || settings.templateId === template.id ? "selected" : ""}`}
              key={template.id}
            >
              <button
                type="button"
                className="soundtrack-template-main"
                onClick={() => selectAndPreview(template)}
              >
                <span>{template.mark}</span>
                <span>
                  <strong>{template.name}</strong>
                  <small>{template.mood}</small>
                </span>
              </button>
              <button
                type="button"
                className="soundtrack-template-action"
                aria-label={
                  settings.templateId === template.id
                    ? `Edit ${template.name}`
                    : `Choose ${template.name}`
                }
                onClick={() =>
                  settings.templateId === template.id
                    ? setEditOpen(true)
                    : selectAndPreview(template)
                }
              >
                {previewingId === template.id
                  ? "❚❚ Playing"
                  : settings.templateId === template.id
                  ? "✎ Edit"
                  : (settings.tracks || []).some(
                        (track) => track.id === template.id,
                      )
                    ? "✓ Added"
                    : "Choose"}
              </button>
            </div>
          ))}
        </div>
        {previewError && <p className="soundtrack-preview-error">{previewError}</p>}
        {editOpen && (
          <section className="soundtrack-clip-editor">
            <header>
              <div>
                <small>EDIT SELECTED SONG</small>
                <strong>{settings.name}</strong>
              </div>
              <button onClick={() => setEditOpen(false)}>Done</button>
            </header>
            <button type="button" className="soundtrack-template-preview-button" onClick={() => {
              const selected = soundtrackTemplates.find((template) => template.id === settings.templateId);
              if (selected) selectAndPreview(selected);
            }}>
              {previewingId === settings.templateId ? "Pause preview" : "Play preview"}
            </button>
            <p className="template-note">
              Music stays soft beneath the experience. Interaction and win
              sounds always play louder.
            </p>
            <label className="field">
              When should it begin?
              <select
                value={settings.startMode}
                onChange={(event) =>
                  onChange({ startMode: event.target.value })
                }
              >
                <option>From the beginning</option>
                <option>From a specific block</option>
              </select>
            </label>
            {settings.startMode === "From a specific block" && (
              <label className="field">
                Start at block
                <select
                  value={startBlock}
                  onChange={(event) =>
                    onChange({ startBlockId: event.target.value })
                  }
                >
                  {blocks.map((block, index) => (
                    <option value={block.id} key={block.id}>
                      {index + 1}. {block.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="soundtrack-trim">
              <div className="trim-times">
                <span>{Math.floor(Number(settings.startSeconds) || 0)}s</span>
                <span>
                  {Math.floor(Number(settings.endSeconds) || duration || 0)}s
                </span>
              </div>
              <div className="dual-range">
                <input
                  aria-label="Song start"
                  type="range"
                  min="0"
                  max={duration || 600}
                  value={settings.startSeconds}
                  onChange={(event) => {
                    onChange({
                      startSeconds: event.target.value,
                      tracks: settings.tracks?.map((track) =>
                        track.id === settings.templateId
                          ? { ...track, startSeconds: event.target.value }
                          : track,
                      ),
                    });
                    if (previewRef.current)
                      previewRef.current.currentTime = Math.max(
                        0,
                        Number(event.target.value) || 0,
                      );
                  }}
                />
                <input
                  aria-label="Song end"
                  type="range"
                  min="0"
                  max={duration || 600}
                  value={settings.endSeconds || Math.floor(duration || 0)}
                  onChange={(event) =>
                    onChange({
                      endSeconds: String(
                        Math.max(
                          Number(event.target.value),
                          Number(settings.startSeconds) + 1,
                        ),
                      ),
                      tracks: settings.tracks?.map((track) =>
                        track.id === settings.templateId
                          ? {
                              ...track,
                              endSeconds: String(
                                Math.max(
                                  Number(event.target.value),
                                  Number(settings.startSeconds) + 1,
                                ),
                              ),
                            }
                          : track,
                      ),
                    })
                  }
                />
              </div>
              <small>Drag either end to choose the part that plays.</small>
            </div>
            <div className="soundtrack-effect-toggles">
              <label>
                <input
                  type="checkbox"
                  checked={settings.fadeIn !== false}
                  onChange={(event) =>
                    onChange({ fadeIn: event.target.checked })
                  }
                />
                <span>Fade in</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.fadeOut !== false}
                  onChange={(event) =>
                    onChange({ fadeOut: event.target.checked })
                  }
                />
                <span>Fade out</span>
              </label>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function WinningTray({
  items,
  open,
  onToggle,
}: {
  items: WonItem[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className={`winning-tray ${open ? "open" : ""}`}>
      <button onClick={onToggle} aria-expanded={open}>
        <span>🏆</span>
        <div>
          <strong>Things you won</strong>
          <small>
            {items.length
              ? `${items.length} collected`
              : "Your prizes appear here"}
          </small>
        </div>
        <b>{items.length}</b>
      </button>
      {open && (
        <div className="winning-list">
          {items.length === 0 ? (
            <p>Play the games to fill this little trophy case.</p>
          ) : (
            items.map((item) => (
              <article key={item.id}>
                <span>✦</span>
                <div>
                  <small>{item.source}</small>
                  <strong>{item.reward}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </aside>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { authHeaders } from "./authClient";
import { TinyBlockCustomization } from "./TinyBlockCustomization";

type CustomBlock = {
  instanceId?: string;
  id: string;
  message: string;
  config?: Record<string, string>;
};

const envelopeChoices = [
  ["Blush satin", "/letters/envelopes/blush-botanical.webp"],
  ["Ivory airmail", "/letters/envelopes/ivory-airmail.webp"],
  ["Midnight velvet", "/letters/envelopes/midnight-velvet.webp"],
  ["Kraft keepsake", "/letters/envelopes/kraft-keepsake.webp"],
  ["Floral garden", "/letters/envelopes/blush-botanical.webp"],
] as const;
const letterPageChoices = [
  ["Classic cream", "/letters/pages/classic-cream.webp"],
  ["Lined notebook", "/letters/pages/lined-notebook.webp"],
  ["Vintage parchment", "/letters/pages/vintage-parchment.webp"],
  ["Floral border", "/letters/botanical-letter-paper-v2.webp"],
  ["Polaroid note", "/letters/pages/classic-cream.webp"],
] as const;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(file: File): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const scale = Math.min(
      1,
      1100 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas
      .getContext("2d")
      ?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("Could not prepare image")),
        "image/jpeg",
        0.82,
      ),
    );
    try {
      const body = new FormData();
      body.append(
        "file",
        blob,
        `${file.name.replace(/\.[^.]+$/, "") || "gift-photo"}.jpg`,
      );
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/media/image`, {
        method: "POST",
        headers: await authHeaders(),
        body,
      });
      if (!response.ok) throw new Error("Upload failed");
      return String((await response.json()).url);
    } catch {
      return blobToDataUrl(blob);
    }
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function BlockCustomization({
  block,
  giftId,
  onMessage,
  onConfig,
}: {
  block: CustomBlock;
  giftId?: string;
  onMessage: (value: string) => void;
  onConfig: (key: string, value: string) => void;
}) {
  const config = block.config || {};

  async function imageUpload(
    key: string,
    nameKey: string,
    files: FileList | null,
  ) {
    const file = files?.[0];
    if (!file) return;
    onConfig(key, await imageToDataUrl(file));
    onConfig(
      nameKey,
      files && files.length > 1 ? `${files.length} photos selected` : file.name,
    );
  }

  if (block.id === "letter")
    return (
      <CustomizationSection
        title="Letter content"
        hint="Written inside the animated letter"
      >
        <label className="field">
          Letter message
          <textarea
            rows={9}
            maxLength={800}
            value={block.message.slice(0, 800)}
            onChange={(event) => onMessage(event.target.value)}
            placeholder="Write as much as you need—a story, a memory, or something from the heart…"
          />
          <small>{Math.min(block.message.length, 800)}/800</small>
        </label>
        <label className="field">
          Sign-off
          <input
            maxLength={40}
            value={config.signoff || ""}
            onChange={(event) => onConfig("signoff", event.target.value)}
            placeholder="— sent with love"
          />
        </label>
        <div className="letter-art-picker">
          <fieldset><legend>Choose an envelope</legend><div>{envelopeChoices.map(([label, image]) => <button type="button" key={label} className={(config.envelopeStyle || "Blush satin") === label ? "active" : ""} onClick={() => onConfig("envelopeStyle", label)}><img src={image} alt="" /><span>{label}</span><b>✓</b></button>)}</div></fieldset>
          <fieldset><legend>Choose letter paper</legend><div>{letterPageChoices.map(([label, image]) => <button type="button" key={label} className={(config.pageType || "Classic cream") === label ? "active" : ""} onClick={() => onConfig("pageType", label)}><img src={image} alt="" /><span>{label}</span><b>✓</b></button>)}</div></fieldset>
        </div>
        <div className="letter-customization-grid">
          <label className="field">
            Letter font
            <select
              value={config.letterFont || "Handwritten"}
              onChange={(event) => onConfig("letterFont", event.target.value)}
            >
              <option>Handwritten</option>
              <option>Romantic script</option>
              <option>Elegant serif</option>
              <option>Vintage typewriter</option>
              <option>Clean modern</option>
            </select>
          </label>
          <label className="field color-field">
            Letter colour
            <span>
              <input
                type="color"
                value={config.letterColor || "#3f3036"}
                onChange={(event) =>
                  onConfig("letterColor", event.target.value)
                }
              />
              <b>{config.letterColor || "#3f3036"}</b>
            </span>
          </label>
          <label className="field">
            Seal / closure
            <select
              value={config.envelopeSeal || "Wax heart"}
              onChange={(event) => onConfig("envelopeSeal", event.target.value)}
            >
              <option>Wax heart</option>
              <option>Monogram wax</option>
              <option>Flower sticker</option>
              <option>Star sticker</option>
              <option>Glue strip</option>
              <option>None</option>
            </select>
          </label>
          <label className="field">
            Stamp
            <select
              value={config.stampStyle || "Rose stamp"}
              onChange={(event) => onConfig("stampStyle", event.target.value)}
            >
              <option>Rose stamp</option>
              <option>Air mail</option>
              <option>Golden heart</option>
              <option>Postmark</option>
              <option>None</option>
            </select>
          </label>
          <label className="field">
            Sticker
            <select
              value={config.stickerStyle || "Daisies"}
              onChange={(event) => onConfig("stickerStyle", event.target.value)}
            >
              <option>Daisies</option>
              <option>Heart cluster</option>
              <option>Stars</option>
              <option>Smiley</option>
              <option>None</option>
            </select>
          </label>
        </div>
        <label className="field">
          Front of envelope
          <input
            maxLength={42}
            value={config.frontText || ""}
            onChange={(event) => onConfig("frontText", event.target.value)}
            placeholder="For someone wonderful"
          />
        </label>
        <label className="field">
          Back of envelope
          <input
            maxLength={42}
            value={config.backText || ""}
            onChange={(event) => onConfig("backText", event.target.value)}
            placeholder="Sealed with love"
          />
        </label>
        <label className="field">
          When the envelope opens
          <select
            value={config.animation || "Flower burst"}
            onChange={(event) => onConfig("animation", event.target.value)}
          >
            <option>Flower burst</option>
            <option>Heart burst</option>
            <option>Petal shower</option>
            <option>Golden sparkles</option>
            <option>Classic unfold</option>
          </select>
          <small>The message appears after the selected animation.</small>
        </label>
        <label className="field effect-density">
          Animation density
          <input
            type="range"
            min="8"
            max="40"
            step="1"
            value={config.effectDensity || "22"}
            onChange={(event) => onConfig("effectDensity", event.target.value)}
          />
          <small>
            {config.effectDensity || "22"} flowers / hearts / sparkles
          </small>
        </label>
      </CustomizationSection>
    );

  if (block.id === "voice")
    return (
      <CustomizationSection
        title="Voice note"
        hint="Only the recording is delivered"
      >
        <VoiceRecorder audioName={config.audioName} onConfig={onConfig} />
        <label className="field">
          Player style
          <select
            value={config.playbackStyle || "Classic waveform"}
            onChange={(event) => onConfig("playbackStyle", event.target.value)}
          >
            <option>Classic waveform</option>
            <option>Floating heart</option>
            <option>Minimal player</option>
          </select>
          <small>The live preview changes instantly.</small>
        </label>
      </CustomizationSection>
    );

  if (block.id === "video")
    return (
      <CustomizationSection
        title="Video note"
        hint="Choose a finished video from your gallery"
      >
        <VideoUploader
          videoName={config.videoName}
          videoUrl={config.videoUrl}
          onConfig={onConfig}
        />
        <label className="field">
          Video frame
          <select
            value={config.videoFrame || config.videoEffect || "Retro cam"}
            onChange={(event) => onConfig("videoFrame", event.target.value)}
          >
            <option>Retro cam</option>
            <option>Warm film</option>
            <option>Polaroid video</option>
            <option>Phone memory</option>
            <option>Classic cinema</option>
            <option>Minimal</option>
          </select>
        </label>
        <label className="field">
          Caption
          <input
            maxLength={70}
            value={config.videoCaption || ""}
            onChange={(event) => onConfig("videoCaption", event.target.value)}
          />
        </label>
        <div className="video-style-grid">
          <label className="field">
            Caption font
            <select
              value={config.videoCaptionFont || "Handwritten"}
              onChange={(event) =>
                onConfig("videoCaptionFont", event.target.value)
              }
            >
              <option>Handwritten</option>
              <option>Romantic script</option>
              <option>Elegant serif</option>
              <option>Clean modern</option>
            </select>
          </label>
          <label className="field color-field">
            Caption colour
            <span>
              <input
                type="color"
                value={config.videoCaptionColor || "#3f3036"}
                onChange={(event) =>
                  onConfig("videoCaptionColor", event.target.value)
                }
              />
              <b>{config.videoCaptionColor || "#3f3036"}</b>
            </span>
          </label>
        </div>
        <label className="field">
          Screen celebration
          <select
            value={config.videoShower || "Petal shower"}
            onChange={(event) => onConfig("videoShower", event.target.value)}
          >
            <option>None</option>
            <option>Flower shower</option>
            <option>Petal shower</option>
            <option>Heart shower</option>
            <option>Golden sparkles</option>
          </select>
          <small>Begins when the recipient plays the video.</small>
        </label>
        {config.videoShower !== "None" && (
          <label className="field effect-density">
            Celebration density
            <input
              type="range"
              min="8"
              max="36"
              step="1"
              value={config.videoShowerDensity || "18"}
              onChange={(event) =>
                onConfig("videoShowerDensity", event.target.value)
              }
            />
            <small>{config.videoShowerDensity || "18"} floating pieces</small>
          </label>
        )}
      </CustomizationSection>
    );

  if (block.id === "flowers")
    return <EGiftEditor config={config} onConfig={onConfig} />;

  if (block.id === "quiz")
    return <QuizEditor config={config} onConfig={onConfig} />;

  if (block.id === "thisorthat")
    return <ThisOrThatEditor config={config} onConfig={onConfig} />;

  if (block.id === "emoji")
    return (
      <CustomizationSection
        title="Emoji decoder"
        hint="Turn an inside joke or memory into a tiny riddle"
      >
        <label className="field">
          Emoji clue
          <input
            maxLength={50}
            value={config.emojiClue || ""}
            onChange={(event) => onConfig("emojiClue", event.target.value)}
          />
        </label>
        <label className="field">
          Accepted answer
          <input
            maxLength={55}
            value={config.emojiAnswer || ""}
            onChange={(event) => onConfig("emojiAnswer", event.target.value)}
          />
        </label>
        <label className="field">
          Optional hint
          <input
            maxLength={70}
            value={config.emojiHint || ""}
            onChange={(event) => onConfig("emojiHint", event.target.value)}
          />
        </label>
      </CustomizationSection>
    );

  if (block.id === "heartcatch")
    return (
      <CustomizationSection
        title="Catch the hearts"
        hint="A small reflex game that unlocks your prize"
      >
        <label className="field">
          Hearts to catch
          <select
            value={config.target || "6"}
            onChange={(event) => onConfig("target", event.target.value)}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Prize they unlock
          <input
            maxLength={70}
            value={config.prize || ""}
            onChange={(event) => onConfig("prize", event.target.value)}
          />
        </label>
      </CustomizationSection>
    );

  if (block.id === "wheel")
    return <WheelEditor config={config} onConfig={onConfig} />;

  if (block.id === "slots")
    return <SlotEditor config={config} onConfig={onConfig} />;

  if (block.id === "puzzle")
    return (
      <CustomizationSection
        title="Photo puzzle"
        hint="Upload the photo they will rebuild"
      >
        <UploadBox
          label="Choose puzzle photo"
          note={config.imageName || "JPG or PNG from your gallery"}
          accept="image/*"
          onFiles={(files) => imageUpload("imageUrl", "imageName", files)}
        />
        <label className="field">
          Difficulty
          <select
            value={config.difficulty}
            onChange={(event) => onConfig("difficulty", event.target.value)}
          >
            <option>3 × 3 · Sweet and simple</option>
            <option>4 × 4 · A little challenge</option>
            <option>5 × 5 · Puzzle lover</option>
          </select>
        </label>
        <label className="puzzle-auto-toggle">
          <input
            type="checkbox"
            checked={config.autoSolver === "true"}
            onChange={(event) =>
              onConfig("autoSolver", String(event.target.checked))
            }
          />
          <span>✦</span>
          <strong>
            Add an Auto Solver
            <small>
              The receiver can watch the photo assemble itself and continue
              automatically.
            </small>
          </strong>
        </label>
        <label className="field">
          Success message
          <input
            maxLength={70}
            value={config.successMessage || ""}
            onChange={(event) => onConfig("successMessage", event.target.value)}
          />
        </label>
      </CustomizationSection>
    );

  if (block.id === "memory")
    return <MemoryEditor config={config} onConfig={onConfig} />;

  if (block.id === "scratch")
    return (
      <CustomizationSection
        title="Hidden reveal"
        hint="Choose exactly what appears underneath"
      >
        <label className="field">
          Hidden surprise
          <input
            maxLength={65}
            value={config.revealText || ""}
            onChange={(event) => onConfig("revealText", event.target.value)}
          />
        </label>
        <label className="field">
          Extra detail
          <input
            maxLength={50}
            value={config.revealDetail || ""}
            onChange={(event) => onConfig("revealDetail", event.target.value)}
          />
        </label>
        <label className="field">
          Scratch coating
          <select
            value={config.coating}
            onChange={(event) => onConfig("coating", event.target.value)}
          >
            <option>Lilac shimmer</option>
            <option>Rose gold</option>
            <option>Silver sparkle</option>
          </select>
        </label>
      </CustomizationSection>
    );

  if (block.id === "treasure")
    return <TreasureEditor config={config} onConfig={onConfig} />;

  if (block.id === "calendar")
    return <CalendarEditor config={config} onConfig={onConfig} />;

  if (
    [
      "wouldrather",
      "neverhave",
      "truthdare",
      "tapheart",
      "matchpair",
      "countdownus",
      "constellation",
      "growthring",
      "movie",
      "song",
      "alwaysyou",
      "excuse",
      "roast",
      "fortune",
      "mysterybox",
      "playlist",
      "countdowninvite",
      "groupboard",
    ].includes(block.id)
  )
    return (
      <TinyBlockCustomization
        id={block.id}
        instanceId={block.instanceId}
        config={config}
        giftId={giftId}
        onConfig={onConfig}
      />
    );

  return <GiftCardEditor config={config} onConfig={onConfig} />;
}

type QuizQuestion = {
  id: string;
  question: string;
  options: { text: string; image: string }[];
  correctIndex: number;
  correctIndices?: number[];
  interaction: "floating" | "normal";
};
type MemoryItem = {
  id: string;
  image: string;
  images?: string[];
  layout?: string;
  caption: string;
  note?: string;
  arrow?: string;
  animation?: string;
};
type TreasureClue = {
  clue: string;
  hint: string;
  answer: string;
  photo?: string;
  caption?: string;
};

function safeParse<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function EGiftEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const effects = [
    "Rose garden",
    "Golden fireworks",
    "Birthday glow",
    "Winter lights",
    "Floating hearts",
    "Starlight",
  ];
  return (
    <CustomizationSection
      title="Celebration scene"
      hint="Choose an elegant full-screen atmosphere"
    >
      <div className="effect-picker">
        {effects.map((label, index) => (
          <button
            key={label}
            className={config.effect === label ? "active" : ""}
            onClick={() => {
              onConfig("effect", label);
              if (
                !config.celebrationTitle ||
                effects.includes(config.celebrationTitle)
              )
                onConfig("celebrationTitle", label);
            }}
          >
            <i className={`effect-swatch swatch-${index}`}>
              <b />
              <b />
              <b />
            </i>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <label className="field">
        When it appears
        <select
          value={config.timing}
          onChange={(event) => onConfig("timing", event.target.value)}
        >
          <option>Entire show</option>
          <option>After winning or interacting</option>
          <option>At the end</option>
          <option>Only on this block</option>
        </select>
      </label>
      <label className="field">
        Animation intensity
        <select
          value={config.intensity}
          onChange={(event) => onConfig("intensity", event.target.value)}
        >
          <option>Gentle</option>
          <option>Lush</option>
          <option>Spectacular</option>
        </select>
      </label>
      <label className="field">
        Scene title
        <input
          maxLength={45}
          value={config.celebrationTitle || config.effect || "Rose garden"}
          onChange={(event) => onConfig("celebrationTitle", event.target.value)}
        />
      </label>
      <label className="field">
        Celebration message
        <input
          maxLength={70}
          value={config.effectNote || ""}
          onChange={(event) => onConfig("effectNote", event.target.value)}
        />
      </label>
      <label className="field">
        Tap instruction
        <input
          maxLength={55}
          value={config.celebrationHint || "Tap to light up the moment"}
          onChange={(event) => onConfig("celebrationHint", event.target.value)}
        />
      </label>
    </CustomizationSection>
  );
}

function QuizEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const fallback: QuizQuestion[] = [
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
      interaction: "floating",
    },
  ];
  const questions = safeParse<QuizQuestion[]>(
    config.quizQuestions,
    fallback,
  ).slice(0, 7);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const update = (next: QuizQuestion[]) =>
    onConfig("quizQuestions", JSON.stringify(next.slice(0, 7)));
  const patchQuestion = (index: number, patch: Partial<QuizQuestion>) =>
    update(
      questions.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  async function askAi() {
    setAiState("loading");
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/ai/quiz-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          relationship: "two people who care deeply about each other",
          tone: "playful, romantic and sweet",
          topic: config.aiThemePrompt || "",
        }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const generated: QuizQuestion[] = (data.questions || []).map(
        (
          item: {
            question?: string;
            options?: string[];
            correctIndex?: number;
            interaction?: string;
          },
          index: number,
        ) => {
          const options = (item.options || [])
            .slice(0, 4)
            .map((text) => ({ text, image: "" }));
          while (options.length < 2)
            options.push({ text: "Another lovely answer", image: "" });
          return {
            id: `ai-${Date.now()}-${index}`,
            question: item.question || "A lovely question",
            options,
            correctIndex: Math.min(
              Math.max(item.correctIndex || 0, 0),
              options.length - 1,
            ),
            interaction: item.interaction === "normal" ? "normal" : "floating",
          };
        },
      );
      update([...questions, ...generated].slice(0, 7));
      setAiState("idle");
    } catch {
      setAiState("error");
    }
  }

  async function optionImage(
    questionIndex: number,
    optionIndex: number,
    files: FileList | null,
  ) {
    const file = files?.[0];
    if (!file) return;
    const image = await imageToDataUrl(file);
    const options = questions[questionIndex].options.map((option, index) =>
      index === optionIndex ? { ...option, image } : option,
    );
    patchQuestion(questionIndex, { options });
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    if (question.options.length <= 2) return;
    const options = question.options.filter(
      (_, index) => index !== optionIndex,
    );
    const correctIndex =
      question.correctIndex === optionIndex
        ? 0
        : question.correctIndex > optionIndex
          ? question.correctIndex - 1
          : question.correctIndex;
    const correctIndices = (
      question.correctIndices?.length
        ? question.correctIndices
        : [question.correctIndex]
    )
      .filter((index) => index !== optionIndex)
      .map((index) => (index > optionIndex ? index - 1 : index));
    patchQuestion(questionIndex, {
      options,
      correctIndex: correctIndices[0] ?? correctIndex,
      correctIndices: correctIndices.length ? correctIndices : [0],
    });
  }

  return (
    <CustomizationSection
      title="Playful quiz"
      hint="Up to 7 questions · 2 to 4 options each"
    >
      <div className="quiz-editor-toolbar">
        <span>{questions.length}/7 questions</span>
        <button
          onClick={askAi}
          disabled={aiState === "loading" || questions.length >= 7}
        >
          {aiState === "loading" ? "Dreaming up questions…" : "✦ Ask AI"}
        </button>
      </div>
      {aiState === "error" && (
        <div className="ai-error">
          AI is taking a little break. Try again in a moment.
        </div>
      )}
      <div className="question-editor-list">
        {questions.map((question, qIndex) => (
          <article key={question.id}>
            <header>
              <strong>Question {qIndex + 1}</strong>
              <button
                onClick={() =>
                  update(questions.filter((_, index) => index !== qIndex))
                }
                disabled={questions.length === 1}
              >
                Remove
              </button>
            </header>
            <label className="field">
              Question
              <input
                maxLength={100}
                value={question.question}
                onChange={(event) =>
                  patchQuestion(qIndex, { question: event.target.value })
                }
              />
            </label>
            <div className="option-editor-list">
              {question.options.map((option, oIndex) => (
                <div className="option-editor" key={oIndex}>
                  <button
                    className={
                      (question.correctIndices?.length
                        ? question.correctIndices
                        : [question.correctIndex]
                      ).includes(oIndex)
                        ? "correct"
                        : ""
                    }
                    onClick={() => {
                      const current = question.correctIndices?.length
                        ? question.correctIndices
                        : [question.correctIndex];
                      const next = current.includes(oIndex)
                        ? current.filter((index) => index !== oIndex)
                        : [...current, oIndex];
                      if (!next.length) return;
                      patchQuestion(qIndex, {
                        correctIndex: next[0],
                        correctIndices: next,
                      });
                    }}
                    title="Mark or unmark as a correct answer"
                  >
                    {(question.correctIndices?.length
                      ? question.correctIndices
                      : [question.correctIndex]
                    ).includes(oIndex)
                      ? "✓"
                      : "○"}
                  </button>
                  {option.image ? (
                    <img src={option.image} alt="Option" />
                  ) : (
                    <label title="Add image">
                      ＋
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          optionImage(qIndex, oIndex, event.target.files)
                        }
                      />
                    </label>
                  )}
                  <input
                    maxLength={55}
                    value={option.text}
                    onChange={(event) => {
                      const options = question.options.map((item, index) =>
                        index === oIndex
                          ? { ...item, text: event.target.value }
                          : item,
                      );
                      patchQuestion(qIndex, { options });
                    }}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  <button
                    className="remove-option"
                    onClick={() => removeOption(qIndex, oIndex)}
                    disabled={question.options.length <= 2}
                    title="Remove this option"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-option"
              disabled={question.options.length >= 4}
              onClick={() =>
                patchQuestion(qIndex, {
                  options: [...question.options, { text: "", image: "" }],
                })
              }
            >
              ＋ Add option <span>{question.options.length}/4</span>
            </button>
            <label className="field">
              This question’s interaction
              <select
                value={question.interaction}
                onChange={(event) =>
                  patchQuestion(qIndex, {
                    interaction: event.target.value as "floating" | "normal",
                  })
                }
              >
                <option value="floating">Wrong answers disappear</option>
                <option value="normal">Normal answers + score</option>
              </select>
            </label>
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={questions.length >= 7}
        onClick={() =>
          update([
            ...questions,
            {
              id: `q-${Date.now()}`,
              question: "",
              options: Array.from({ length: 4 }, () => ({
                text: "",
                image: "",
              })),
              correctIndex: 0,
              interaction: "normal",
            },
          ])
        }
      >
        ＋ Add another question
      </button>
    </CustomizationSection>
  );
}

type ThisOrThatRound = {
  prompt: string;
  left: string;
  right: string;
  senderPick?: string;
};

function ThisOrThatEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const rounds = safeParse<ThisOrThatRound[]>(config.thisOrThatRounds, [
    { prompt: "Our perfect evening", left: "Movie night", right: "Long drive" },
  ]).slice(0, 7);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [tone, setTone] = useState(config.thisOrThatTone || "Romantic");
  const [count, setCount] = useState(
    Math.min(7, Math.max(3, Number(config.thisOrThatCount) || 5)),
  );
  const update = (next: ThisOrThatRound[]) =>
    onConfig("thisOrThatRounds", JSON.stringify(next.slice(0, 7)));
  const patch = (index: number, key: keyof ThisOrThatRound, value: string) =>
    update(
      rounds.map((round, roundIndex) =>
        roundIndex === index ? { ...round, [key]: value } : round,
      ),
    );
  async function fetchAi() {
    setAiState("loading");
    onConfig("thisOrThatTone", tone);
    onConfig("thisOrThatCount", String(count));
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/ai/playful-prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          gameType: "thisorthat",
          relationship: "two people who care about each other",
          tone,
          count,
          topic: config.aiThemePrompt || "",
        }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const generated: ThisOrThatRound[] = (data.items || [])
        .slice(0, count)
        .map((item: { prompt?: string; options?: string[] }) => ({
          prompt: item.prompt || "Choose quickly",
          left: item.options?.[0] || "This",
          right: item.options?.[1] || "That",
          senderPick: "",
        }));
      if (generated.length < 3) throw new Error();
      update(generated);
      setAiState("idle");
    } catch {
      setAiState("error");
    }
  }
  return (
    <CustomizationSection
      title="This or that"
      hint="AI choices, sender picks and an optional private match report"
    >
      <div className="this-or-that-ai">
        <div>
          <label className="field">
            Question mood
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              <option>Romantic</option>
              <option>Playful</option>
              <option>Deep</option>
              <option>Flirty</option>
              <option>Friends</option>
            </select>
          </label>
          <label className="field">
            Questions
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            >
              {[3, 4, 5, 6, 7].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={() => void fetchAi()} disabled={aiState === "loading"}>
          {aiState === "loading" ? "Creating choices…" : "✦ Fetch AI choices"}
        </button>
        {aiState === "error" && (
          <small>AI could not create choices right now. Try again.</small>
        )}
      </div>
      <div className="choice-round-editor">
        {rounds.map((round, index) => (
          <article key={index}>
            <header>
              <strong>Choice {index + 1}</strong>
              <button
                disabled={rounds.length <= 3}
                onClick={() =>
                  update(rounds.filter((_, roundIndex) => roundIndex !== index))
                }
              >
                Remove
              </button>
            </header>
            <label className="field">
              Prompt
              <input
                maxLength={65}
                value={round.prompt}
                onChange={(event) => patch(index, "prompt", event.target.value)}
              />
            </label>
            <div>
              <label className="field">
                Left choice
                <input
                  maxLength={35}
                  value={round.left}
                  onChange={(event) => patch(index, "left", event.target.value)}
                />
              </label>
              <label className="field">
                Right choice
                <input
                  maxLength={35}
                  value={round.right}
                  onChange={(event) =>
                    patch(index, "right", event.target.value)
                  }
                />
              </label>
            </div>
            <fieldset className="sender-pick">
              <legend>What would you pick? · tap again to clear</legend>
              <button
                className={round.senderPick === "left" ? "active" : ""}
                onClick={() =>
                  patch(
                    index,
                    "senderPick",
                    round.senderPick === "left" ? "" : "left",
                  )
                }
              >
                {round.left || "Left"}
              </button>
              <button
                className={round.senderPick === "right" ? "active" : ""}
                onClick={() =>
                  patch(
                    index,
                    "senderPick",
                    round.senderPick === "right" ? "" : "right",
                  )
                }
              >
                {round.right || "Right"}
              </button>
            </fieldset>
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={rounds.length >= 7}
        onClick={() =>
          update([
            ...rounds,
            { prompt: "", left: "", right: "", senderPick: "" },
          ])
        }
      >
        ＋ Add another choice
      </button>
      <label className="compatibility-toggle">
        <input
          type="checkbox"
          checked={config.compatibilityEnabled === "true"}
          onChange={(event) =>
            onConfig("compatibilityEnabled", String(event.target.checked))
          }
        />
        <span />
        <div>
          <strong>Create a compatibility report</strong>
          <small>
            After the recipient answers, the report is available on the shared
            link with the private PIN you set at checkout.
          </small>
        </div>
      </label>
    </CustomizationSection>
  );
}

function WheelEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const prizes = (config.prizes || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const prizeCount = prizes.length;
  const spinCount = Math.min(Number(config.spins) || 1, 6);
  const planned = (config.plannedResults || "").split("\n");
  function setPlannedResult(index: number, value: string) {
    const next = Array.from(
      { length: spinCount },
      (_, spinIndex) => planned[spinIndex] || prizes[0] || "",
    );
    next[index] = value;
    onConfig("plannedResults", next.join("\n"));
  }
  return (
    <CustomizationSection
      title="Spin wheel rules"
      hint="Up to 5 options and 6 planned spins"
    >
      <label className="field">
        Wheel options
        <textarea
          rows={5}
          value={config.prizes || ""}
          onChange={(event) =>
            onConfig(
              "prizes",
              event.target.value.split("\n").slice(0, 5).join("\n"),
            )
          }
        />
        <small>{prizeCount}/5</small>
      </label>
      <label className="field">
        Number of spins
        <select
          value={config.spins}
          onChange={(event) => onConfig("spins", event.target.value)}
        >
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Results
        <select
          value={config.resultMode}
          onChange={(event) => onConfig("resultMode", event.target.value)}
        >
          <option>Random</option>
          <option>Plan every spin</option>
        </select>
      </label>
      {config.resultMode === "Plan every spin" && (
        <div className="planned-spin-results">
          <strong>Select each outcome</strong>
          {Array.from({ length: spinCount }, (_, index) => (
            <label key={index}>
              Spin {index + 1}
              <select
                value={prizes.includes(planned[index]) ? planned[index] : ""}
                onChange={(event) =>
                  setPlannedResult(index, event.target.value)
                }
                disabled={!prizes.length}
              >
                <option value="" disabled>
                  Choose a wheel option
                </option>
                {prizes.map((prize) => (
                  <option key={prize}>{prize}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <label className="field">
        Reveal animation
        <select
          value={config.revealAnimation}
          onChange={(event) => onConfig("revealAnimation", event.target.value)}
        >
          <option>Confetti burst</option>
          <option>Petal shower</option>
          <option>Golden glow</option>
        </select>
      </label>
    </CustomizationSection>
  );
}

function SlotEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const prizes = (config.prizes || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const pullCount = Math.min(Number(config.pulls) || 1, 6);
  const planned = (config.plannedResults || "").split("\n");
  function setPlanned(index: number, value: string) {
    const next = Array.from(
      { length: pullCount },
      (_, pullIndex) => planned[pullIndex] || "",
    );
    next[index] = value;
    onConfig("plannedResults", next.join("\n"));
  }
  return (
    <CustomizationSection
      title="Slot machine"
      hint="They pull the lever to line up a prize"
    >
      <label className="field">
        Possible prizes
        <textarea
          rows={5}
          value={config.prizes || ""}
          onChange={(event) =>
            onConfig(
              "prizes",
              event.target.value.split("\n").slice(0, 5).join("\n"),
            )
          }
        />
        <small>{prizes.length}/5</small>
      </label>
      <label className="field">
        Number of lever pulls
        <select
          value={config.pulls}
          onChange={(event) => onConfig("pulls", event.target.value)}
        >
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Prize outcomes
        <select
          value={config.resultMode}
          onChange={(event) => onConfig("resultMode", event.target.value)}
        >
          <option>Random</option>
          <option>Plan every pull</option>
        </select>
      </label>
      {config.resultMode === "Plan every pull" && (
        <div className="planned-spin-results">
          <strong>Select each outcome</strong>
          {Array.from({ length: pullCount }, (_, index) => (
            <label key={index}>
              Pull {index + 1}
              <select
                value={prizes.includes(planned[index]) ? planned[index] : ""}
                onChange={(event) => setPlanned(index, event.target.value)}
              >
                <option value="" disabled>
                  Choose a prize
                </option>
                {prizes.map((prize) => (
                  <option key={prize}>{prize}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <label className="field">
        Winning animation
        <select
          value={config.revealAnimation}
          onChange={(event) => onConfig("revealAnimation", event.target.value)}
        >
          <option>Sparkle shower</option>
          <option>Confetti pop</option>
          <option>Golden glow</option>
        </select>
      </label>
    </CustomizationSection>
  );
}

function CalendarEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const days = Math.min(Number(config.days) || 7, 30);
  const defaults = [
    "A reason I adore you",
    "A favourite memory",
    "A tiny promise",
    "A photo that makes me smile",
    "Your song of the day",
    "A little challenge",
    "Your final surprise",
  ];
  const stored = safeParse<string[]>(config.calendarNotes, defaults);
  const notes = Array.from(
    { length: days },
    (_, index) => stored[index] || `A little surprise for day ${index + 1}`,
  );
  function setDays(value: string) {
    const count = Number(value);
    onConfig("days", value);
    onConfig(
      "calendarNotes",
      JSON.stringify(
        Array.from(
          { length: count },
          (_, index) =>
            stored[index] || `A little surprise for day ${index + 1}`,
        ),
      ),
    );
  }
  function setNote(index: number, value: string) {
    onConfig(
      "calendarNotes",
      JSON.stringify(
        notes.map((note, noteIndex) => (noteIndex === index ? value : note)),
      ),
    );
  }
  return (
    <CustomizationSection
      title="Unlock calendar"
      hint="A series of little gifts revealed over several days"
    >
      <div className="calendar-explainer">
        <span>1</span>
        <p>You write one short surprise for every day.</p>
        <span>2</span>
        <p>The recipient opens the available numbered door.</p>
        <span>3</span>
        <p>A new door unlocks each day—or you can make them all available.</p>
      </div>
      <label className="field">
        Number of days
        <select
          value={config.days}
          onChange={(event) => setDays(event.target.value)}
        >
          <option>7</option>
          <option>14</option>
          <option>30</option>
        </select>
      </label>
      <label className="field">
        Unlock schedule
        <select
          value={config.unlockRule}
          onChange={(event) => onConfig("unlockRule", event.target.value)}
        >
          <option>One per day</option>
          <option>Recipient can open anytime</option>
        </select>
      </label>
      {config.unlockRule === "One per day" && (
        <label className="field">
          First day
          <input
            type="date"
            value={config.startDate || ""}
            onChange={(event) => onConfig("startDate", event.target.value)}
          />
        </label>
      )}
      <div className="calendar-note-list">
        <strong>What each door reveals</strong>
        {notes.map((note, index) => (
          <label key={index}>
            <span>Day {index + 1}</span>
            <input
              maxLength={80}
              value={note}
              onChange={(event) => setNote(index, event.target.value)}
            />
          </label>
        ))}
      </div>
    </CustomizationSection>
  );
}

function MemoryEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const storedItems = safeParse<MemoryItem[]>(config.memoryItems, []);
  const [captionState, setCaptionState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [pendingBatch, setPendingBatch] = useState<
    { file: File; preview: string }[]
  >([]);
  const [uploadingMemories, setUploadingMemories] = useState(false);
  const upgraded = config.extraPages === "true";
  const maxPages = upgraded ? 12 : 7;
  const items = storedItems.slice(0, maxPages);
  const remaining = Math.max(0, maxPages - items.length);
  const pageAnimations = [
    ["Polaroid pop", "▱"],
    ["Soft zoom", "◎"],
    ["Film slide", "→"],
    ["Sparkle reveal", "✦"],
    ["Page curl", "◩"],
    ["Photo scatter", "⌁"],
    ["Crossfade", "◌"],
    ["Flip book", "↶"],
    ["Wash reveal", "▨"],
    ["Ken Burns", "⌕"],
  ];
  function clearPendingBatch() {
    pendingBatch.forEach((item) => URL.revokeObjectURL(item.preview));
    setPendingBatch([]);
  }
  async function uploadSingles(files: File[]) {
    if (!files.length || remaining === 0) return;
    setUploadingMemories(true);
    const added = await Promise.all(
      files.slice(0, remaining).map(async (file, index) => ({
        id: `memory-${Date.now()}-${index}`,
        image: await imageToDataUrl(file),
        caption: file.name.replace(/\.[^.]+$/, ""),
        note: "",
        arrow: "Curve right",
        animation: "Polaroid pop",
      })),
    );
    onConfig(
      "memoryItems",
      JSON.stringify([...items, ...added].slice(0, maxPages)),
    );
    setUploadingMemories(false);
    clearPendingBatch();
  }
  async function uploadCollage(files: File[]) {
    if (!files.length || remaining === 0) return;
    const chosen = files.slice(0, 4);
    if (chosen.length < 2) return;
    setUploadingMemories(true);
    const images = await Promise.all(chosen.map(imageToDataUrl));
    const item: MemoryItem = {
      id: `collage-${crypto.randomUUID()}`,
      image: images[0],
      images,
      layout:
        images.length === 2
          ? "Two-photo collage"
          : images.length === 3
            ? "Three-photo collage"
            : "Four-photo grid",
      caption: "A collage of us",
      note: "",
      arrow: "Curve right",
      animation: "Polaroid pop",
    };
    onConfig(
      "memoryItems",
      JSON.stringify([...items, item].slice(0, maxPages)),
    );
    setUploadingMemories(false);
    clearPendingBatch();
  }
  function chooseMemoryFiles(files: FileList | null) {
    if (!files || !files.length || remaining === 0) return;
    const chosen = Array.from(files).slice(0, Math.max(remaining, 4));
    if (chosen.length === 1) {
      void uploadSingles(chosen);
      return;
    }
    clearPendingBatch();
    setPendingBatch(
      chosen.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    );
  }
  async function cover(files: FileList | null) {
    const file = files?.[0];
    if (file) onConfig("coverImage", await imageToDataUrl(file));
  }
  function patch(index: number, key: keyof MemoryItem, value: string) {
    onConfig(
      "memoryItems",
      JSON.stringify(
        items.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      ),
    );
  }
  async function fillCaptions() {
    if (!items.length || captionState === "loading") return;
    setCaptionState("loading");
    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const photoLabels = items
        .map(
          (item, index) =>
            `Page ${index + 1}: ${item.caption || "uploaded memory"}`,
        )
        .join("; ");
      const response = await fetch(`${api}/api/ai/playful-prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          gameType: "memorycaptions",
          relationship: `A personal memory album. Existing photo labels: ${photoLabels}`,
          tone: "warm, specific, affectionate and natural",
          count: items.length,
        }),
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { items?: { prompt?: string }[] };
      const suggestions = (data.items || [])
        .map((item) => (item.prompt || "").trim())
        .filter(Boolean);
      if (suggestions.length !== items.length) throw new Error();
      onConfig(
        "memoryItems",
        JSON.stringify(
          items.map((item, index) => ({
            ...item,
            caption: suggestions[index].slice(0, 65),
          })),
        ),
      );
      setCaptionState("done");
    } catch {
      setCaptionState("error");
    }
  }
  return (
    <CustomizationSection
      title="Scrapbook album"
      hint="Design every page with photos, words, arrows and motion"
    >
      <div className="memory-cover-note">
        <img
          src={config.coverImage || "/mypookie-letter-photo.png"}
          alt="Memory book cover"
        />
        <div>
          <strong>Your cover</strong>
          <span>Shown first when the memory lane opens.</span>
        </div>
      </div>
      <UploadBox
        label="Customize cover photo"
        note="The complete photo will stay visible"
        accept="image/*"
        onFiles={cover}
      />
      <label className="field">
        Cover caption
        <input
          maxLength={65}
          value={config.coverCaption || "Our little book of us"}
          onChange={(event) => onConfig("coverCaption", event.target.value)}
        />
      </label>
      <label className="field">
        Album style
        <select
          value={config.albumStyle || "Blush scrapbook"}
          onChange={(event) => {
            const next = event.target.value;
            const dark = [
              "Midnight love story",
              "Luxury leather album",
              "Celestial night",
            ];
            onConfig("albumStyle", next);
            if (
              dark.includes(next) &&
              (!config.albumTextColor || config.albumTextColor === "#49343e")
            )
              onConfig("albumTextColor", "#f8eef3");
            else if (
              !dark.includes(next) &&
              config.albumTextColor === "#f8eef3"
            )
              onConfig("albumTextColor", "#49343e");
          }}
        >
          <option>Blush scrapbook</option>
          <option>Retro travel album</option>
          <option>Midnight love story</option>
          <option>Playful sticker book</option>
          <option>Pressed flower journal</option>
          <option>Luxury leather album</option>
          <option>Minimal linen book</option>
          <option>Celestial night</option>
          <option>Vintage botanical</option>
        </select>
      </label>
      <div className="memory-typography-grid">
        <label className="field">
          Album font
          <select
            value={config.albumFont || "Handwritten"}
            onChange={(event) => onConfig("albumFont", event.target.value)}
          >
            <option>Handwritten</option>
            <option>Romantic script</option>
            <option>Elegant serif</option>
            <option>Vintage typewriter</option>
            <option>Clean modern</option>
          </select>
        </label>
        <label className="field color-field">
          Text colour
          <span>
            <input
              type="color"
              value={config.albumTextColor || "#49343e"}
              onChange={(event) =>
                onConfig("albumTextColor", event.target.value)
              }
            />
            <b>{config.albumTextColor || "#49343e"}</b>
          </span>
        </label>
      </div>
      <div className="album-page-meter">
        <div>
          <strong>
            {items.length} / {maxPages} album pages
          </strong>
          <span>The cover is separate and free.</span>
        </div>
        <b>{remaining} left</b>
      </div>
      <label className="album-upgrade">
        <input
          type="checkbox"
          checked={upgraded}
          onChange={(event) => {
            onConfig("extraPages", String(event.target.checked));
            if (!event.target.checked && items.length > 7)
              onConfig("memoryItems", JSON.stringify(items.slice(0, 7)));
          }}
        />
        <span>＋5</span>
        <div>
          <strong>Add five more album pages</strong>
          <small>Increase the limit from 7 to 12 pages.</small>
        </div>
        <b>₹20</b>
      </label>
      <div className={remaining === 0 ? "upload-disabled" : ""}>
        <UploadBox
          label="Add memory photos"
          note={
            remaining
              ? `Each photo becomes a page · ${remaining} available`
              : "Page limit reached"
          }
          accept="image/*"
          multiple
          onFiles={chooseMemoryFiles}
        />
      </div>
      {uploadingMemories && (
        <div className="memory-upload-progress">
          <i />
          <span>Preparing and uploading your photos…</span>
        </div>
      )}
      {pendingBatch.length > 1 && (
        <section className="memory-batch-choice">
          <header>
            <div>
              <small>{pendingBatch.length} PHOTOS SELECTED</small>
              <strong>How should these appear?</strong>
            </div>
            <button onClick={clearPendingBatch}>×</button>
          </header>
          <div className="memory-batch-thumbnails">
            {pendingBatch.map((item) => (
              <img
                key={`${item.file.name}-${item.file.lastModified}`}
                src={item.preview}
                alt={item.file.name}
              />
            ))}
          </div>
          <div className="memory-batch-actions">
            <button
              onClick={() =>
                void uploadSingles(pendingBatch.map((item) => item.file))
              }
            >
              <span>▱ ▱</span>
              <strong>Separate pages</strong>
              <small>One photo on each page</small>
            </button>
            <button
              onClick={() =>
                void uploadCollage(pendingBatch.map((item) => item.file))
              }
            >
              <span>▦</span>
              <strong>One collage</strong>
              <small>Combine up to four photos</small>
            </button>
          </div>
        </section>
      )}
      <div className="memory-ai-captions">
        <span>✦</span>
        <div>
          <strong>Let AI caption the album</strong>
          <small>
            Creates one short caption for every uploaded page. You can edit each
            one afterwards.
          </small>
        </div>
        <button
          disabled={!items.length || captionState === "loading"}
          onClick={() => void fillCaptions()}
        >
          {captionState === "loading"
            ? "Writing…"
            : captionState === "done"
              ? "Refresh captions"
              : items.length
                ? `Caption ${items.length} page${items.length === 1 ? "" : "s"}`
                : "Upload photos first"}
        </button>
        {captionState === "error" && (
          <output>
            AI could not write captions just now. Please try again.
          </output>
        )}
      </div>
      <div className="memory-item-editor scrapbook-editor">
        {items.map((item, index) => (
          <article key={item.id}>
            {item.images && item.images.length > 1 ? (
              <div className={`editor-collage collage-${item.images.length}`}>
                {item.images.map((image, imageIndex) => (
                  <img
                    src={image}
                    alt={`Collage photo ${imageIndex + 1}`}
                    key={imageIndex}
                  />
                ))}
              </div>
            ) : (
              <img src={item.image} alt="Uploaded memory" />
            )}
            <div className="scrapbook-page-fields">
              {item.images && item.images.length > 1 && (
                <label>
                  Collage layout
                  <select
                    value={item.layout || "Four-photo grid"}
                    onChange={(event) =>
                      patch(index, "layout", event.target.value)
                    }
                  >
                    <option>Two-photo collage</option>
                    <option>Three-photo collage</option>
                    <option>Four-photo grid</option>
                  </select>
                </label>
              )}
              <label>
                Photo caption
                <input
                  maxLength={65}
                  value={item.caption}
                  onChange={(event) =>
                    patch(index, "caption", event.target.value)
                  }
                />
              </label>
              <label>
                Handwritten text
                <textarea
                  rows={2}
                  maxLength={140}
                  value={item.note || ""}
                  onChange={(event) => patch(index, "note", event.target.value)}
                  placeholder="Add a date, joke or tiny memory…"
                />
              </label>
              <div>
                <label>
                  Curved arrow
                  <select
                    value={item.arrow || "Curve right"}
                    onChange={(event) =>
                      patch(index, "arrow", event.target.value)
                    }
                  >
                    <option>Curve right</option>
                    <option>Curve left</option>
                    <option>Loop around</option>
                    <option>None</option>
                  </select>
                </label>
                <div className="memory-animation-picker">
                  <span>Page animation</span>
                  <div>
                    {pageAnimations.map(([label, icon]) => (
                      <button
                        type="button"
                        key={label}
                        className={
                          (item.animation || "Polaroid pop") === label
                            ? "active"
                            : ""
                        }
                        onClick={() => patch(index, "animation", label)}
                        title={label}
                      >
                        <i>{icon}</i>
                        <small>{label}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                onConfig(
                  "memoryItems",
                  JSON.stringify(items.filter((_, i) => i !== index)),
                )
              }
            >
              ×
            </button>
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <div className="collection-empty">
          Your uploaded pages will appear here.
        </div>
      )}
    </CustomizationSection>
  );
}

function TreasureEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  const clues = safeParse<TreasureClue[]>(config.treasureClues, [
    { clue: "", hint: "", answer: "", photo: "", caption: "" },
  ]);
  const patch = (index: number, key: keyof TreasureClue, value: string) =>
    onConfig(
      "treasureClues",
      JSON.stringify(
        clues.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      ),
    );
  async function cluePhoto(index: number, files: FileList | null) {
    const file = files?.[0];
    if (file) patch(index, "photo", await imageToDataUrl(file));
  }
  return (
    <CustomizationSection
      title="Treasure hunt"
      hint="Each clue has an answer and optional hint"
    >
      <div className="treasure-editor-list">
        {clues.map((item, index) => (
          <article key={index}>
            <header>
              <strong>Clue {index + 1}</strong>
              <button
                disabled={clues.length === 1}
                onClick={() =>
                  onConfig(
                    "treasureClues",
                    JSON.stringify(clues.filter((_, i) => i !== index)),
                  )
                }
              >
                Remove
              </button>
            </header>
            <label className="clue-photo-upload">
              {item.photo ? (
                <img src={item.photo} alt={`Clue ${index + 1}`} />
              ) : (
                <span>＋</span>
              )}
              <strong>
                {item.photo ? "Change optional photo" : "Add optional photo"}
                <small>
                  {item.photo
                    ? "This visual clue will be shown."
                    : "Skip this if the clue only needs text."}
                </small>
              </strong>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => cluePhoto(index, event.target.files)}
              />
            </label>
            {item.photo && (
              <button
                className="remove-clue-photo"
                onClick={() => patch(index, "photo", "")}
              >
                Remove photo
              </button>
            )}
            <label className="field">
              Photo caption
              <input
                maxLength={65}
                value={item.caption || ""}
                onChange={(event) =>
                  patch(index, "caption", event.target.value)
                }
              />
            </label>
            <label className="field">
              Clue
              <input
                maxLength={100}
                value={item.clue}
                onChange={(event) => patch(index, "clue", event.target.value)}
              />
            </label>
            <label className="field">
              Hint
              <input
                maxLength={80}
                value={item.hint}
                onChange={(event) => patch(index, "hint", event.target.value)}
              />
            </label>
            <label className="field">
              Accepted answer
              <input
                maxLength={45}
                value={item.answer}
                onChange={(event) => patch(index, "answer", event.target.value)}
              />
            </label>
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={clues.length >= 7}
        onClick={() =>
          onConfig(
            "treasureClues",
            JSON.stringify([
              ...clues,
              { clue: "", hint: "", answer: "", photo: "", caption: "" },
            ]),
          )
        }
      >
        ＋ Add clue
      </button>
      <label className="field">
        Final reward
        <input
          maxLength={70}
          value={config.finalSurprise || ""}
          onChange={(event) => onConfig("finalSurprise", event.target.value)}
        />
      </label>
    </CustomizationSection>
  );
}

function GiftCardEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: (key: string, value: string) => void;
}) {
  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a5",
    });
    doc.setFillColor(255, 246, 249);
    doc.rect(0, 0, 210, 148, "F");
    doc.setFillColor(43, 27, 46);
    doc.roundedRect(18, 20, 174, 108, 8, 8, "F");
    doc.setTextColor(255, 111, 145);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("mypookie.", 30, 38);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(config.brand || "A gift for you", 30, 61);
    if (config.showValue !== "false") {
      doc.setTextColor(255, 184, 107);
      doc.setFontSize(18);
      doc.text(config.value || "A special treat", 30, 79);
    }
    if (config.showCode !== "false") {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text(`Code: ${config.code || "POOKIE-LOVE-24"}`, 30, 96);
    }
    if (config.showNote !== "false") {
      doc.setTextColor(225, 216, 229);
      doc.setFontSize(10);
      doc.text(
        doc.splitTextToSize(
          config.giftMessage || "Choose something that makes you smile.",
          145,
        ),
        30,
        111,
      );
    }
    doc.save("mypookie-gift-card.pdf");
  }
  return (
    <CustomizationSection
      title="Gift card experience"
      hint="Choose the reveal, content and downloadable card"
    >
      <p className="gift-card-safe-note">
        <span>✓</span>
        <strong>Your gift card is safe with us.</strong>
        <small>
          It stays securely attached to this private gift, ready whenever the
          recipient returns.
        </small>
      </p>
      <label className="field">
        Reveal interaction
        <select
          value={config.interaction || "Scratchable card"}
          onChange={(event) => onConfig("interaction", event.target.value)}
        >
          <option>Scratchable card</option>
          <option>Flip to reveal</option>
          <option>Blur to unblur</option>
        </select>
      </label>
      <label className="field">
        Brand or gift name
        <input
          maxLength={40}
          value={config.brand || ""}
          onChange={(event) => onConfig("brand", event.target.value)}
        />
      </label>
      <label className="field">
        Code or redemption link
        <input
          maxLength={80}
          value={config.code || ""}
          onChange={(event) => onConfig("code", event.target.value)}
        />
      </label>
      <label className="field">
        Value
        <input
          maxLength={20}
          value={config.value || ""}
          onChange={(event) => onConfig("value", event.target.value)}
        />
      </label>
      <label className="field">
        Personal note
        <textarea
          rows={3}
          maxLength={120}
          value={config.giftMessage || ""}
          onChange={(event) => onConfig("giftMessage", event.target.value)}
        />
        <small>{(config.giftMessage || "").length}/120</small>
      </label>
      <div className="card-info-toggles">
        {[
          ["showCode", "Show code"],
          ["showValue", "Show value"],
          ["showNote", "Show note"],
        ].map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={config[key] !== "false"}
              onChange={(event) => onConfig(key, String(event.target.checked))}
            />
            {label}
          </label>
        ))}
      </div>
      <button className="download-card" onClick={downloadPdf}>
        ↓ Download beautiful gift-card PDF
      </button>
    </CustomizationSection>
  );
}

function CustomizationSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dedicated-customization">
      <div className="dedicated-title">
        <strong>{title}</strong>
        <span>{hint}</span>
      </div>
      {children}
    </section>
  );
}

function UploadBox({
  label,
  note,
  accept,
  multiple,
  onFiles,
}: {
  label: string;
  note: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <label className="upload dedicated-upload">
      ▧<strong>{label}</strong>
      <span>{note}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => onFiles(event.target.files)}
      />
    </label>
  );
}

function VoiceRecorder({
  audioName,
  onConfig,
}: {
  audioName?: string;
  onConfig: (key: string, value: string) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "recording" | "uploading" | "ready" | "error"
  >("idle");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypes = [
        "audio/mp4;codecs=mp4a.40.2",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const mimeType = mimeTypes.find((type) =>
        globalThis.MediaRecorder?.isTypeSupported(type),
      );
      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunks.current = [];
      mediaRecorder.ondataavailable = (event) =>
        event.data.size && chunks.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        await storeAudio(
          blob,
          `voice-note-${Date.now()}.${blob.type.includes("mp4") ? "m4a" : "webm"}`,
          `Recorded voice note · ${seconds || 1}s`,
        );
      };
      recorder.current = mediaRecorder;
      mediaRecorder.start(250);
      setSeconds(0);
      setStatus("recording");
      timer.current = window.setInterval(
        () => setSeconds((value) => value + 1),
        1000,
      );
    } catch {
      setStatus("error");
    }
  }

  function stop() {
    recorder.current?.stop();
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setStatus("error");
      return;
    }
    await storeAudio(file, file.name, file.name);
  }

  async function storeAudio(blob: Blob, filename: string, label: string) {
    setStatus("uploading");
    try {
      const body = new FormData();
      body.append("file", blob, filename);
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/media/audio`, {
        method: "POST",
        headers: await authHeaders(),
        body,
      });
      if (!response.ok) throw new Error("Upload failed");
      const stored = await response.json();
      onConfig("audioUrl", String(stored.url));
      onConfig("audioName", label);
      setStatus("ready");
    } catch {
      onConfig("audioUrl", await blobToDataUrl(blob));
      onConfig("audioName", label);
      setStatus("error");
    }
  }

  return (
    <div className="voice-recorder">
      {status === "recording" ? (
        <button className="record recording" onClick={stop}>
          ■ Stop recording <span>{seconds}s recorded</span>
        </button>
      ) : (
        <button
          className="record"
          onClick={start}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? "Saving securely…" : "● Record voice note"}{" "}
          <span>{audioName || "Tap to allow microphone access"}</span>
        </button>
      )}
      <label className="audio-upload">
        or upload audio
        <input
          type="file"
          accept="audio/*"
          onChange={(event) => upload(event.target.files)}
        />
      </label>
      {status === "error" && (
        <p>
          The note can play in this draft, but secure cloud saving needs you to
          be signed in. You can record again after signing in.
        </p>
      )}
    </div>
  );
}

function VideoUploader({
  videoName,
  videoUrl,
  onConfig,
}: {
  videoName?: string;
  videoUrl?: string;
  onConfig: (key: string, value: string) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "ready" | "error"
  >("idle");
  const [localPreview, setLocalPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const lastBlob = useRef<Blob | null>(null);
  const [retryBlob, setRetryBlob] = useState<Blob | null>(null);

  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview],
  );

  async function storeVideo(blob: Blob, name: string) {
    setStatus("uploading");
    try {
      const body = new FormData();
      body.append("file", blob, name);
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://backend-production-22bd.up.railway.app";
      const response = await fetch(`${api}/api/media/video`, {
        method: "POST",
        headers: await authHeaders(),
        body,
      });
      if (!response.ok) throw new Error();
      const stored = await response.json();
      onConfig("videoUrl", stored.url);
      onConfig("videoName", stored.name || name);
      setStatus("ready");
    } catch {
      onConfig("videoUrl", await blobToDataUrl(blob));
      setErrorMessage(
        "The video is saved inside this draft for now. Secure cloud media storage will activate after Firebase Storage is enabled.",
      );
      setStatus("error");
    }
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage("Video notes must be 30 MB or smaller.");
      setStatus("error");
      return;
    }
    lastBlob.current = file;
    setRetryBlob(file);
    const preview = URL.createObjectURL(file);
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return preview;
    });
    onConfig("videoName", file.name);
    await storeVideo(file, file.name);
  }

  function retake() {
    onConfig("videoUrl", "");
    onConfig("videoName", "");
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview("");
    lastBlob.current = null;
    setRetryBlob(null);
    setErrorMessage("");
    setStatus("idle");
  }

  return (
    <div className="video-recorder gallery-only">
      {(localPreview || videoUrl) && (
        <video
          className="video-preview-mini"
          src={localPreview || videoUrl}
          controls
          playsInline
          preload="metadata"
        />
      )}
      <label
        className={`video-gallery-upload ${status === "uploading" ? "uploading" : ""}`}
      >
        <span>▣</span>
        <strong>
          {status === "uploading"
            ? "Uploading securely…"
            : videoUrl
              ? "Choose a different video"
              : "Choose video from gallery"}
        </strong>
        <small>{videoName || "MP4, MOV or WebM · maximum 30 MB"}</small>
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={(event) => upload(event.target.files)}
          disabled={status === "uploading"}
        />
      </label>
      {videoUrl && (
        <button className="retake-video" onClick={retake}>
          Remove video
        </button>
      )}
      {status === "error" && retryBlob && (
        <button
          className="retake-video"
          onClick={() =>
            void storeVideo(
              retryBlob,
              videoName || `video-note-${crypto.randomUUID()}.webm`,
            )
          }
        >
          Save video securely
        </button>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}

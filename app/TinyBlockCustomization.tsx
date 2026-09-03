"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "./authClient";

type Props = {
  id: string;
  instanceId?: string;
  config: Record<string, string>;
  giftId?: string;
  onConfig: (key: string, value: string) => void;
};

type Pair = {
  left: string;
  right: string;
  senderPick?: string;
  leftReaction?: string;
  rightReaction?: string;
};
type NeverHaveCard = {
  id: string;
  statement: string;
  senderPick?: string;
  haventReaction?: string;
  haveReaction?: string;
};
type PairPhoto = { id: string; image: string; caption: string };
type AlwaysQuestion = { id: string; question: string; answers: string[] };
type ExcuseRound = { id: string; situation: string; senderExcuse: string };
type BoardNote = { from: string; message: string };
type SavedResponse = {
  id: string;
  contributorName: string;
  responseText: string;
  photoUrls: string;
  createdAt: string;
};
const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";

function parse<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lineValues(value: string | undefined, fallback: string[]) {
  const values = (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length ? values : fallback;
}

async function imageToDataUrl(file: File) {
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
      800 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas
      .getContext("2d")
      ?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    URL.revokeObjectURL(source);
  }
}

function Section({
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

function Lines({
  label,
  configKey,
  value,
  max,
  onConfig,
}: {
  label: string;
  configKey: string;
  value: string;
  max: number;
  onConfig: Props["onConfig"];
}) {
  const count = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean).length;
  return (
    <label className="field">
      {label}
      <textarea
        rows={Math.min(max, 6)}
        value={value}
        onChange={(event) =>
          onConfig(
            configKey,
            event.target.value.split("\n").slice(0, max).join("\n"),
          )
        }
      />
      <small>
        {count}/{max}
      </small>
    </label>
  );
}

export function TinyBlockCustomization({
  id,
  instanceId,
  config,
  giftId,
  onConfig,
}: Props) {
  if (id === "wouldrather")
    return <WouldRatherEditor config={config} onConfig={onConfig} />;
  if (id === "neverhave")
    return <NeverHaveEditor config={config} onConfig={onConfig} />;
  if (id === "truthdare")
    return (
      <Section
        title="Truth or Dare Roulette"
        hint="Truth answers are saved for the sender"
      >
        <label className="field">
          Number of spins
          <select
            value={config.truthDareSpins || "1"}
            onChange={(event) => onConfig("truthDareSpins", event.target.value)}
          >
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} {index ? "spins" : "spin"}
              </option>
            ))}
          </select>
          <small>The recipient completes every result before continuing.</small>
        </label>
        <Lines
          label="Truth prompts"
          configKey="truths"
          value={config.truths || ""}
          max={8}
          onConfig={onConfig}
        />
        <Lines
          label="Dare prompts"
          configKey="dares"
          value={config.dares || ""}
          max={8}
          onConfig={onConfig}
        />
        <ResponseInbox
          giftId={giftId}
          blockId={instanceId || "truthdare"}
          title="Saved truth answers"
        />
      </Section>
    );
  if (id === "tapheart")
    return <TapHeartEditor config={config} onConfig={onConfig} />;
  if (id === "matchpair")
    return <MatchPairEditor config={config} onConfig={onConfig} />;
  if (id === "countdownus")
    return (
      <Section
        title="Countdown to Us"
        hint="A live counter that keeps moving every second"
      >
        <label className="field">
          Your special date
          <input
            type="datetime-local"
            value={config.sinceDate || ""}
            onChange={(event) => onConfig("sinceDate", event.target.value)}
          />
        </label>
        <label className="field">
          Counter label
          <input
            maxLength={60}
            value={config.counterLabel || ""}
            onChange={(event) => onConfig("counterLabel", event.target.value)}
          />
        </label>
      </Section>
    );
  if (id === "constellation")
    return (
      <Section
        title="Constellation Map"
        hint="Choose your constellation; the recipient will draw theirs beside it"
      >
        <label className="field">
          Your constellation shape
          <select
            value={config.constellationShape || "Heart"}
            onChange={(event) =>
              onConfig("constellationShape", event.target.value)
            }
          >
            <option>Heart</option>
            <option>Crown</option>
            <option>Infinity</option>
            <option>Little bear</option>
          </select>
        </label>
        <label className="field">
          Star name
          <input
            maxLength={40}
            value={config.starName || ""}
            onChange={(event) => onConfig("starName", event.target.value)}
          />
        </label>
        <label className="field">
          Message
          <textarea
            rows={3}
            maxLength={120}
            value={config.starMessage || ""}
            onChange={(event) => onConfig("starMessage", event.target.value)}
          />
          <small>{(config.starMessage || "").length}/120</small>
        </label>
        <label className="field">
          Sky style
          <select
            value={config.skyStyle || "Midnight rose"}
            onChange={(event) => onConfig("skyStyle", event.target.value)}
          >
            <option>Midnight rose</option>
            <option>Deep indigo</option>
            <option>Golden dusk</option>
          </select>
        </label>
      </Section>
    );
  if (id === "growthring")
    return (
      <GrowthRingEditor
        config={config}
        giftId={giftId}
        instanceId={instanceId}
        onConfig={onConfig}
      />
    );
  if (id === "movie")
    return <MovieEditor config={config} onConfig={onConfig} />;
  if (id === "song") return <SongEditor config={config} onConfig={onConfig} />;
  if (id === "alwaysyou")
    return <AlwaysYouEditor config={config} onConfig={onConfig} />;
  if (id === "excuse")
    return <ExcuseEditor config={config} onConfig={onConfig} />;
  if (id === "roast")
    return (
      <Section title="Roast Me Gently" hint="Affectionate complaints only">
        <Lines
          label="Loving roasts · one per line"
          configKey="roasts"
          value={config.roasts || ""}
          max={10}
          onConfig={onConfig}
        />
        <label className="field">
          Cookie design
          <select
            value={config.cookieDesign || "Classic golden"}
            onChange={(event) => onConfig("cookieDesign", event.target.value)}
          >
            <option>Classic golden</option>
            <option>Pink velvet</option>
            <option>Chocolate dipped</option>
            <option>Starry lavender</option>
          </select>
        </label>
      </Section>
    );
  if (id === "fortune")
    return (
      <Section
        title="Fortune Cookie Break"
        hint="Each crack randomly reveals one feel-good fortune"
      >
        <Lines
          label="Feel-good fortunes · one per line"
          configKey="fortunes"
          value={config.fortunes || ""}
          max={12}
          onConfig={onConfig}
        />
      </Section>
    );
  if (id === "tarot")
    return (
      <Section
        title="Tarot Cat Fortune"
        hint="Nine fresh, positive fortunes are prepared while the cat welcomes them"
      >
        <label className="field">
          Fortune theme
          <input
            maxLength={90}
            placeholder="Love, confidence, friendship, a new chapter…"
            value={config.tarotTheme || ""}
            onChange={(event) => onConfig("tarotTheme", event.target.value)}
          />
          <small>The AI keeps every reading warm, safe and uplifting.</small>
        </label>
        <button className="tiny-ai-start" type="button" onClick={() => onConfig("tarotGeneration", String(Date.now()))}>✦ Start AI fortune generation</button>
        <small>Set the theme first, then prepare the nine cards with one click.</small>
      </Section>
    );
  if (id === "drawtogether")
    return (
      <Section title="Draw Together" hint="You both draw the same simple prompt">
        <label className="field">
          What should you both draw?
          <input maxLength={40} value={config.drawPrompt || "A flower"} onChange={(event) => onConfig("drawPrompt", event.target.value)} />
        </label>
        <div className="draw-editor-prompts">
          {["A flower", "An iPhone", "A tiny house", "A cat", "A birthday cake", "A happy cloud"].map(prompt => (
            <button type="button" key={prompt} className={(config.drawPrompt || "A flower") === prompt ? "active" : ""} onClick={() => onConfig("drawPrompt", prompt)}>{prompt}</button>
          ))}
        </div>
        <small>Draw and save on the live board. The recipient will receive the same prompt without seeing your drawing.</small>
      </Section>
    );
  if (id === "mysterybox")
    return (
      <Section
        title="Mystery Box"
        hint="The box shakes before revealing one surprise"
      >
        <Lines
          label="Possible surprises"
          configKey="surprises"
          value={config.surprises || ""}
          max={8}
          onConfig={onConfig}
        />
        <label className="field">
          Reveal mode
          <select
            value={config.boxMode || "Random"}
            onChange={(event) => onConfig("boxMode", event.target.value)}
          >
            <option>Random</option>
            <option>Always reveal the first</option>
          </select>
        </label>
      </Section>
    );
  if (id === "playlist")
    return (
      <Section
        title="Playlist Reveal"
        hint="A typed dedication appears before the link opens"
      >
        <label className="field">
          Playlist title
          <input
            maxLength={55}
            value={config.playlistTitle || ""}
            onChange={(event) => onConfig("playlistTitle", event.target.value)}
          />
        </label>
        <label className="field">
          Playlist link
          <input
            type="url"
            value={config.playlistUrl || ""}
            onChange={(event) => onConfig("playlistUrl", event.target.value)}
          />
        </label>
        <label className="field">
          Dedication
          <textarea
            rows={4}
            maxLength={140}
            value={config.dedication || ""}
            onChange={(event) => onConfig("dedication", event.target.value)}
          />
          <small>{(config.dedication || "").length}/140</small>
        </label>
      </Section>
    );
  if (id === "countdowninvite")
    return (
      <Section
        title="Countdown Invite"
        hint="Plan an event and collect their playful RSVP"
      >
        <label className="field">
          Event title
          <input
            maxLength={55}
            value={config.eventTitle || ""}
            onChange={(event) => onConfig("eventTitle", event.target.value)}
          />
        </label>
        <label className="field">
          Date and time
          <input
            type="datetime-local"
            value={config.eventDate || ""}
            onChange={(event) => onConfig("eventDate", event.target.value)}
          />
        </label>
        <label className="field">
          What they should know
          <textarea
            rows={3}
            maxLength={100}
            value={config.inviteNote || ""}
            onChange={(event) => onConfig("inviteNote", event.target.value)}
          />
        </label>
      </Section>
    );
  if (id === "groupboard")
    return (
      <GroupBoardEditor config={config} giftId={giftId} onConfig={onConfig} />
    );
  return null;
}

function ModePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="play-mode-picker">
      <button
        className={value === "playAlong" ? "active" : ""}
        onClick={() => onChange("playAlong")}
      >
        <span>⇄</span>
        <strong>Play along</strong>
        <small>Pick your own answers too</small>
      </button>
      <button
        className={value === "react" ? "active" : ""}
        onClick={() => onChange("react")}
      >
        <span>♡</span>
        <strong>React to their choice</strong>
        <small>Prepare a reaction for each answer</small>
      </button>
    </div>
  );
}

function WouldRatherEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const pairs = parse<Pair[]>(config.pairs, [
    { left: "Sunrise date", right: "Midnight drive" },
  ]).slice(0, 8);
  const mode = config.wouldRatherMode || "playAlong";
  const update = (next: Pair[]) =>
    onConfig("pairs", JSON.stringify(next.slice(0, 8)));
  const patch = (index: number, values: Partial<Pair>) =>
    update(
      pairs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item,
      ),
    );
  return (
    <Section
      title="Would You Rather"
      hint="Play along with their picks or prepare a reaction for each choice"
    >
      <ModePicker
        value={mode}
        onChange={(value) => onConfig("wouldRatherMode", value)}
      />
      <div className="tiny-editor-list">
        {pairs.map((pair, index) => (
          <article key={index}>
            <header>
              <strong>Card {index + 1}</strong>
              <button
                disabled={pairs.length === 1}
                onClick={() =>
                  update(pairs.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                Remove
              </button>
            </header>
            <div>
              <label className="field">
                This
                <input
                  maxLength={40}
                  value={pair.left}
                  onChange={(event) =>
                    patch(index, { left: event.target.value })
                  }
                />
              </label>
              <label className="field">
                Or that
                <input
                  maxLength={40}
                  value={pair.right}
                  onChange={(event) =>
                    patch(index, { right: event.target.value })
                  }
                />
              </label>
            </div>
            {mode === "playAlong" ? (
              <fieldset className="sender-pick">
                <legend>What would you pick? · tap again to clear</legend>
                <button
                  className={pair.senderPick === "left" ? "active" : ""}
                  onClick={() =>
                    patch(index, {
                      senderPick: pair.senderPick === "left" ? "" : "left",
                    })
                  }
                >
                  {pair.left || "Left"}
                </button>
                <button
                  className={pair.senderPick === "right" ? "active" : ""}
                  onClick={() =>
                    patch(index, {
                      senderPick: pair.senderPick === "right" ? "" : "right",
                    })
                  }
                >
                  {pair.right || "Right"}
                </button>
              </fieldset>
            ) : (
              <div className="reaction-editor">
                <label className="field">
                  If they choose “{pair.left || "This"}”
                  <input
                    maxLength={90}
                    value={pair.leftReaction || ""}
                    onChange={(event) =>
                      patch(index, { leftReaction: event.target.value })
                    }
                    placeholder="Your reaction… e.g. I knew you'd pick this 😂"
                  />
                </label>
                <label className="field">
                  If they choose “{pair.right || "That"}”
                  <input
                    maxLength={90}
                    value={pair.rightReaction || ""}
                    onChange={(event) =>
                      patch(index, { rightReaction: event.target.value })
                    }
                    placeholder="Your reaction… e.g. Okay, this surprised me 👀"
                  />
                </label>
              </div>
            )}
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={pairs.length >= 8}
        onClick={() =>
          update([
            ...pairs,
            {
              left: "",
              right: "",
              senderPick: "",
              leftReaction: "",
              rightReaction: "",
            },
          ])
        }
      >
        ＋ Add either/or card
      </button>
    </Section>
  );
}

function NeverHaveEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const legacy = lineValues(config.statements, [
    "Danced in the kitchen",
    "Re-read our old chats",
  ]);
  const fallback = legacy.map((statement, index) => ({
    id: `never-${index}`,
    statement,
  }));
  const cards = parse<NeverHaveCard[]>(config.neverHaveCards, fallback).slice(
    0,
    10,
  );
  const mode = config.neverHaveMode || "playAlong";
  const update = (next: NeverHaveCard[]) => {
    const limited = next.slice(0, 10);
    onConfig("neverHaveCards", JSON.stringify(limited));
    onConfig("statements", limited.map((item) => item.statement).join("\n"));
  };
  const patch = (index: number, values: Partial<NeverHaveCard>) =>
    update(
      cards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item,
      ),
    );
  return (
    <Section
      title="Never Have I Ever"
      hint="Use proper Never Have I Ever statements—never Truth or Dare prompts"
    >
      <ModePicker
        value={mode}
        onChange={(value) => onConfig("neverHaveMode", value)}
      />
      <div className="tiny-editor-list never-have-editor">
        {cards.map((card, index) => (
          <article key={card.id}>
            <header>
              <strong>Statement {index + 1}</strong>
              <button
                disabled={cards.length === 1}
                onClick={() =>
                  update(cards.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                Remove
              </button>
            </header>
            <label className="field">
              Never have I ever…
              <input
                maxLength={90}
                value={card.statement}
                onChange={(event) =>
                  patch(index, { statement: event.target.value })
                }
                placeholder="Danced in the kitchen at midnight"
              />
            </label>
            {mode === "playAlong" ? (
              <fieldset className="sender-pick">
                <legend>What would you pick? · tap again to clear</legend>
                <button
                  className={card.senderPick === "havent" ? "active" : ""}
                  onClick={() =>
                    patch(index, {
                      senderPick: card.senderPick === "havent" ? "" : "havent",
                    })
                  }
                >
                  I haven’t
                </button>
                <button
                  className={card.senderPick === "have" ? "active" : ""}
                  onClick={() =>
                    patch(index, {
                      senderPick: card.senderPick === "have" ? "" : "have",
                    })
                  }
                >
                  I have
                </button>
              </fieldset>
            ) : (
              <div className="reaction-editor">
                <label className="field">
                  If they choose “I haven’t”
                  <input
                    maxLength={90}
                    value={card.haventReaction || ""}
                    onChange={(event) =>
                      patch(index, { haventReaction: event.target.value })
                    }
                    placeholder="Your reaction… e.g. We need to fix that!"
                  />
                </label>
                <label className="field">
                  If they choose “I have”
                  <input
                    maxLength={90}
                    value={card.haveReaction || ""}
                    onChange={(event) =>
                      patch(index, { haveReaction: event.target.value })
                    }
                    placeholder="Your reaction… e.g. I absolutely remember this 😂"
                  />
                </label>
              </div>
            )}
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={cards.length >= 10}
        onClick={() =>
          update([
            ...cards,
            {
              id: `never-${Date.now()}`,
              statement: "",
              senderPick: "",
              haventReaction: "",
              haveReaction: "",
            },
          ])
        }
      >
        ＋ Add another statement
      </button>
      <label className="tiny-check">
        <input
          type="checkbox"
          checked={config.shareSummary !== "false"}
          onChange={(event) =>
            onConfig("shareSummary", String(event.target.checked))
          }
        />{" "}
        Add their final picks to the result summary
      </label>
    </Section>
  );
}

function TapHeartEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onConfig("tapImage", await imageToDataUrl(file));
    onConfig("tapImageName", file.name);
  }
  async function uploadAvoid(files: FileList | null) {
    const file = files?.[0];
    if (file) onConfig("avoidImage", await imageToDataUrl(file));
  }
  return (
    <Section
      title="Tap the Hearts"
      hint="Replace the heart with any custom photo or character"
    >
      <label className="field">
        Round length
        <select
          value={config.duration || "10"}
          onChange={(event) => onConfig("duration", event.target.value)}
        >
          <option>5</option>
          <option>10</option>
          <option>15</option>
        </select>
        <small>seconds</small>
      </label>
      <label className="field">
        Score heading
        <input
          maxLength={55}
          value={config.scoreTitle || ""}
          onChange={(event) => onConfig("scoreTitle", event.target.value)}
        />
      </label>
      <div className="style-row">
        <label className="field">
          Levels
          <select
            value={config.tapLevels || "1"}
            onChange={(event) => onConfig("tapLevels", event.target.value)}
          >
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Tries
          <select
            value={config.tapTries || "3"}
            onChange={(event) => onConfig("tapTries", event.target.value)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <label
        className={`upload dedicated-upload tap-image-upload ${config.avoidImage ? "has-image" : ""}`}
      >
        {config.avoidImage ? (
          <img src={config.avoidImage} alt="Avoid target" />
        ) : (
          <span className="tap-image-placeholder">×</span>
        )}
        <strong>
          {config.avoidImage
            ? "Change do-not-tap image"
            : "Upload what they must not tap"}
        </strong>
        <span>Defaults to a cross. Speed increases each level.</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => void uploadAvoid(event.target.files)}
        />
      </label>
      {config.avoidImage && (
        <button
          className="remove-poster-image"
          onClick={() => onConfig("avoidImage", "")}
        >
          Use the cross again
        </button>
      )}
      <label className="field">
        What should the score call them?
        <input
          maxLength={24}
          value={config.tapTargetLabel || "hearts"}
          onChange={(event) => onConfig("tapTargetLabel", event.target.value)}
          placeholder="hearts, smiles, pookies…"
        />
      </label>
      <label
        className={`upload dedicated-upload tap-image-upload ${config.tapImage ? "has-image" : ""}`}
      >
        {config.tapImage ? (
          <img src={config.tapImage} alt="Custom tap target preview" />
        ) : (
          <span className="tap-image-placeholder">♥</span>
        )}
        <strong>
          {config.tapImage ? "Change tap image" : "Upload a custom tap image"}
        </strong>
        <span>Square photos and transparent PNGs work best</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => void upload(event.target.files)}
        />
      </label>
      {config.tapImage && (
        <button
          className="remove-poster-image"
          onClick={() => {
            onConfig("tapImage", "");
            onConfig("tapImageName", "");
          }}
        >
          Use the heart again
        </button>
      )}
    </Section>
  );
}

function ExcuseEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const legacy = linesToExcuseRounds(config.excuses);
  const rounds = parse<ExcuseRound[]>(config.excuseRounds, legacy).slice(0, 6);
  const update = (next: ExcuseRound[]) =>
    onConfig("excuseRounds", JSON.stringify(next.slice(0, 6)));
  return (
    <Section
      title="Our Excuse Generator"
      hint="You both invent one excuse for the same playful situation"
    >
      <div className="tiny-editor-list excuse-round-editor">
        {rounds.map((round, index) => (
          <article key={round.id}>
            <header>
              <strong>Situation {index + 1}</strong>
              <button
                disabled={rounds.length === 1}
                onClick={() =>
                  update(rounds.filter((_, roundIndex) => roundIndex !== index))
                }
              >
                Remove
              </button>
            </header>
            <label className="field">
              The situation
              <textarea
                rows={2}
                maxLength={110}
                value={round.situation}
                onChange={(event) =>
                  update(
                    rounds.map((item, roundIndex) =>
                      roundIndex === index
                        ? { ...item, situation: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="We need an excuse to sneak away for ice cream…"
              />
              <small>{round.situation.length}/110</small>
            </label>
            <label className="field">
              Your excuse
              <textarea
                rows={2}
                maxLength={140}
                value={round.senderExcuse}
                onChange={(event) =>
                  update(
                    rounds.map((item, roundIndex) =>
                      roundIndex === index
                        ? { ...item, senderExcuse: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="The moon personally requested a snack run…"
              />
              <small>{round.senderExcuse.length}/140</small>
            </label>
          </article>
        ))}
      </div>
      <button
        className="add-collection-item"
        disabled={rounds.length >= 6}
        onClick={() =>
          update([
            ...rounds,
            {
              id: `excuse-${Date.now()}`,
              situation: "We need a ridiculous excuse to meet right now.",
              senderExcuse: "",
            },
          ])
        }
      >
        ＋ Add another situation
      </button>
      <p className="tiny-editor-note">
        The recipient sees one situation, writes their own excuse, and then both
        answers are revealed together.
      </p>
    </Section>
  );
}

function linesToExcuseRounds(value: string | undefined): ExcuseRound[] {
  const values = (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const excuses = values.length
    ? values
    : ["There is an emergency hug shortage."];
  return excuses.slice(0, 6).map((senderExcuse, index) => ({
    id: `legacy-excuse-${index}`,
    situation: "We need a playful excuse to meet right now.",
    senderExcuse,
  }));
}

function MatchPairEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const photos = parse<PairPhoto[]>(config.pairPhotos, []).slice(0, 6);
  async function add(files: FileList | null) {
    if (!files) return;
    const added = await Promise.all(
      Array.from(files)
        .slice(0, 6 - photos.length)
        .map(async (file, index) => ({
          id: `pair-${Date.now()}-${index}`,
          image: await imageToDataUrl(file),
          caption: file.name.replace(/\.[^.]+$/, ""),
        })),
    );
    onConfig("pairPhotos", JSON.stringify([...photos, ...added].slice(0, 6)));
  }
  const desiredPairs = Math.max(
    2,
    Math.min(
      6,
      Math.floor((Number.parseInt(config.matchGrid || "8", 10) || 8) / 2),
    ),
  );
  return (
    <Section
      title="Match the Pair"
      hint="Every opening starts with a newly shuffled deck"
    >
      <label className="field">
        Grid size
        <select
          value={`${desiredPairs * 2} cards · ${desiredPairs} pairs`}
          onChange={(event) => onConfig("matchGrid", event.target.value)}
        >
          {[2, 3, 4, 5, 6].map((pairs) => (
            <option key={pairs}>
              {pairs * 2} cards · {pairs} pairs
            </option>
          ))}
        </select>
      </label>
      <label className="upload dedicated-upload">
        ▥<strong>Add your photos</strong>
        <span>{Math.min(photos.length, 6)}/6 memories ready</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => add(event.target.files)}
        />
      </label>
      <div className="pair-photo-editor">
        {photos.map((photo, index) => (
          <article key={photo.id}>
            <img src={photo.image} alt="Pair memory" />
            <input
              maxLength={35}
              value={photo.caption}
              onChange={(event) =>
                onConfig(
                  "pairPhotos",
                  JSON.stringify(
                    photos.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, caption: event.target.value }
                        : item,
                    ),
                  ),
                )
              }
            />
            <button
              onClick={() =>
                onConfig(
                  "pairPhotos",
                  JSON.stringify(
                    photos.filter((_, itemIndex) => itemIndex !== index),
                  ),
                )
              }
            >
              ×
            </button>
          </article>
        ))}
      </div>
      {photos.length < desiredPairs && (
        <p className="tiny-editor-note">
          Add {desiredPairs - photos.length} more photo
          {desiredPairs - photos.length === 1 ? "" : "s"} for this grid. The
          preview uses beautiful sample cards until then.
        </p>
      )}
    </Section>
  );
}

function AlwaysYouEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const fallback: AlwaysQuestion[] = [
    {
      id: "always-1",
      question: config.question || "Who makes every ordinary day better?",
      answers: (
        config.answers ||
        "You\nStill you\nObviously you\nThe person reading this"
      )
        .split("\n")
        .filter(Boolean)
        .slice(0, 4),
    },
  ];
  const questions = parse<AlwaysQuestion[]>(
    config.alwaysYouQuestions,
    fallback,
  ).slice(0, 7);
  const update = (next: AlwaysQuestion[]) =>
    onConfig("alwaysYouQuestions", JSON.stringify(next.slice(0, 7)));
  return (
    <Section
      title="The Answer Was Always You"
      hint="Add up to seven playful questions with affectionate answer choices"
    >
      <div className="tiny-editor-list always-you-editor">
        {questions.map((item, index) => (
          <article key={item.id}>
            <header>
              <strong>Question {index + 1}</strong>
              <button
                disabled={questions.length === 1}
                onClick={() =>
                  update(
                    questions.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Remove
              </button>
            </header>
            <label className="field">
              Question
              <input
                maxLength={90}
                value={item.question}
                onChange={(event) =>
                  update(
                    questions.map((question, itemIndex) =>
                      itemIndex === index
                        ? { ...question, question: event.target.value }
                        : question,
                    ),
                  )
                }
              />
            </label>
            <div className="always-answer-list">
              {item.answers.slice(0, 4).map((answer, answerIndex) => (
                <label className="field" key={answerIndex}>
                  Answer {answerIndex + 1}
                  <span className="inline-answer">
                    <input
                      maxLength={42}
                      value={answer}
                      onChange={(event) =>
                        update(
                          questions.map((question, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...question,
                                  answers: question.answers.map(
                                    (value, valueIndex) =>
                                      valueIndex === answerIndex
                                        ? event.target.value
                                        : value,
                                  ),
                                }
                              : question,
                          ),
                        )
                      }
                    />
                    <button
                      disabled={item.answers.length <= 2}
                      onClick={() =>
                        update(
                          questions.map((question, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...question,
                                  answers: question.answers.filter(
                                    (_, valueIndex) =>
                                      valueIndex !== answerIndex,
                                  ),
                                }
                              : question,
                          ),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                </label>
              ))}
            </div>
            <button
              className="add-collection-item compact"
              disabled={item.answers.length >= 4}
              onClick={() =>
                update(
                  questions.map((question, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...question,
                          answers: [...question.answers, "Still you"],
                        }
                      : question,
                  ),
                )
              }
            >
              ＋ Add answer
            </button>
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
              id: `always-${Date.now()}`,
              question: "Who is the obvious answer this time?",
              answers: ["You", "Still you"],
            },
          ])
        }
      >
        ＋ Add another question
      </button>
    </Section>
  );
}

function GrowthRingEditor({
  config,
  giftId,
  instanceId,
  onConfig,
}: {
  config: Record<string, string>;
  giftId?: string;
  instanceId?: string;
  onConfig: Props["onConfig"];
}) {
  const fallback = [
    "The day our story really began",
    "The adventure we still laugh about",
    "The moment I knew this bond was special",
    "A challenge that made us stronger",
    "The chapter I hope we grow into next",
  ];
  const memories = parse<string[]>(config.growthSenderMemories, fallback).slice(
    0,
    5,
  );
  const values = Array.from({ length: 5 }, (_, index) => memories[index] || "");
  const [refreshing, setRefreshing] = useState(false);
  async function refreshGrowthQuestions() {
    setRefreshing(true);
    try {
      const response = await fetch(`${api}/api/ai/playful-prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          gameType: "growthring",
          relationship:
            "a meaningful bond told through milestones, challenges, memories and hopes",
          tone: "easy, warm, specific relationship questions",
          count: 5,
        }),
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        items?: Array<{ prompt?: string }>;
      };
      const prompts = (data.items || [])
        .map((item) => item.prompt?.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (prompts.length)
        onConfig("growthSenderMemories", JSON.stringify(prompts));
    } finally {
      setRefreshing(false);
    }
  }
  const update = (index: number, value: string) =>
    onConfig(
      "growthSenderMemories",
      JSON.stringify(
        values.map((item, itemIndex) => (itemIndex === index ? value : item)),
      ),
    );
  return (
    <Section
      title="Our Growing Story"
      hint="You each answer five AI-guided milestones; together they become an animated relationship timeline"
    >
      <button
        className="add-collection-item compact"
        onClick={() => void refreshGrowthQuestions()}
        disabled={refreshing}
      >
        {refreshing
          ? "Creating questions…"
          : "✦ Refresh five questions with AI"}
      </button>
      <div className="bond-question-editor">
        {values.map((memory, index) => (
          <label className="field" key={index}>
            Your memory or event {index + 1}
            <textarea
              rows={2}
              maxLength={120}
              value={memory}
              onChange={(event) => update(index, event.target.value)}
              placeholder="A moment you never want to forget…"
            />
            <small>{memory.length}/120</small>
          </label>
        ))}
      </div>
      <p className="tiny-editor-note">
        The recipient answers the same five prompts. Their moments and yours
        then bloom into one shared timeline.
      </p>
      <ResponseInbox
        giftId={giftId}
        blockId={instanceId || "growthring"}
        title="Their growth-ring answers"
      />
    </Section>
  );
}

function MovieEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const templates = [
    "Golden musical",
    "Rainy romance",
    "Road-trip ensemble",
    "Vintage Bollywood",
    "Spacebound love",
    "Indie polaroid",
  ];
  async function poster(files: FileList | null) {
    const file = files?.[0];
    if (file) onConfig("posterImage", await imageToDataUrl(file));
  }
  return (
    <Section
      title="If Your Story Was a Movie"
      hint="Three short answers from each of you become an AI-made film reveal"
    >
      <BondQuestionEditor mode="movie" config={config} onConfig={onConfig} />
      <details className="movie-visual-details">
        <summary>Customize the poster reveal</summary>
        <label className="movie-poster-upload">
          {config.posterImage ? (
            <img src={config.posterImage} alt="Uploaded movie poster" />
          ) : (
            <span>▰</span>
          )}
          <strong>
            {config.posterImage
              ? "Change your poster"
              : "Upload your own poster"}
            <small>Portrait JPG or PNG works best</small>
          </strong>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => poster(event.target.files)}
          />
        </label>
        {config.posterImage && (
          <button
            className="remove-poster-image"
            onClick={() => onConfig("posterImage", "")}
          >
            Remove uploaded poster
          </button>
        )}
        <div className="poster-template-picker">
          {templates.map((template, index) => (
            <button
              key={template}
              className={`${config.posterTemplate === template ? "active" : ""} poster-sample-${index}`}
              onClick={() => onConfig("posterTemplate", template)}
            >
              <i />
              <strong>{template}</strong>
              <span>Original template</span>
            </button>
          ))}
        </div>
        <label className="field">
          Preferred genre
          <select
            value={config.genre || "Romantic comedy"}
            onChange={(event) => onConfig("genre", event.target.value)}
          >
            <option>Let AI decide</option>
            <option>Romantic comedy</option>
            <option>Coming-of-age</option>
            <option>Adventure</option>
            <option>Indie romance</option>
            <option>Epic friendship</option>
          </select>
        </label>
      </details>
    </Section>
  );
}

function SongEditor({
  config,
  onConfig,
}: {
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  return (
    <Section
      title="If We Were a Song"
      hint="Two sets of answers become one original title, sound and lyrical identity"
    >
      <BondQuestionEditor mode="song" config={config} onConfig={onConfig} />
      <label className="field">
        Musical direction
        <select
          value={config.songStyle || "Dreamy acoustic"}
          onChange={(event) => onConfig("songStyle", event.target.value)}
        >
          <option>Let AI decide</option>
          <option>Dreamy acoustic</option>
          <option>Warm indie pop</option>
          <option>Bollywood romance</option>
          <option>Late-night R&B</option>
          <option>Joyful friendship anthem</option>
        </select>
      </label>
    </Section>
  );
}

function BondQuestionEditor({
  mode,
  config,
  onConfig,
}: {
  mode: "movie" | "song";
  config: Record<string, string>;
  onConfig: Props["onConfig"];
}) {
  const fallback = [
    "How did your relationship begin, and what changed after that day?",
    "Which shared memory captures your bond better than any other?",
    "When life gets difficult, how do the two of you show up for each other?",
    "What kind of adventure feels most like the two of you?",
    "Which emotion defines your relationship right now?",
    "What do you hope the next chapter together feels like?",
  ];
  const questions = parse<string[]>(config.bondQuestions, fallback);
  const answers = parse<string[]>(config.senderBondAnswers, []);
  const questionCount = mode === "movie" ? 3 : 6;
  const normalizedQuestions = Array.from(
    { length: questionCount },
    (_, index) => questions[index] || fallback[index],
  );
  const normalizedAnswers = Array.from(
    { length: questionCount },
    (_, index) => answers[index] || "",
  );
  const patchAnswer = (index: number, value: string) =>
    onConfig(
      "senderBondAnswers",
      JSON.stringify(
        normalizedAnswers.map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      ),
    );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch(`${api}/api/ai/playful-prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          gameType: mode,
          relationship: `A real ${config.relationshipType || "meaningful relationship"}; questions must uncover how they met, shared memories, emotional dynamic, conflict style, favourite moments and hopes for the future so an AI can accurately match a ${mode}.`,
          tone: `simple, short, ${config.bondQuestionTone || "Playful"}`,
          count: questionCount,
        }),
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        items?: Array<{ prompt?: string }>;
      };
      const next = data.items
        ?.map((item) => item.prompt?.trim())
        .filter((value): value is string => Boolean(value))
        .slice(0, questionCount);
      if (!next?.length) throw new Error();
      onConfig("bondQuestions", JSON.stringify(next));
      onConfig("senderBondAnswers", "[]");
    } catch {
      setError("AI couldn’t refresh these right now. Try again in a moment.");
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <div className="bond-question-editor">
      <div className="bond-required-note">
        <strong>You need to answer these questions.</strong>
        <span>
          They are quick, easy situations about your bond; the recipient answers
          the same set before AI creates the reveal.
        </span>
      </div>
      <div className="bond-how">
        <span>1</span>
        <p>You answer these now.</p>
        <span>2</span>
        <p>They answer the same set while opening the gift.</p>
        <span>3</span>
        <p>AI compares both perspectives and creates the reveal.</p>
      </div>
      <div className="bond-ai-refresh">
        <label>
          Question mood
          <select
            value={config.bondQuestionTone || "Playful"}
            onChange={(event) =>
              onConfig("bondQuestionTone", event.target.value)
            }
          >
            <option>Playful</option>
            <option>Romantic</option>
            <option>Chaotic</option>
            <option>Flirty</option>
            <option>Sexy (18+ · non-explicit)</option>
            <option>Nostalgic</option>
          </select>
        </label>
        <button onClick={() => void refresh()} disabled={refreshing}>
          ↻{" "}
          {refreshing
            ? "Refreshing fun questions…"
            : "Refresh questions with AI"}
        </button>
        <small>Questions are AI-curated; the sender only answers them.</small>
        {error && <output>{error}</output>}
      </div>
      {normalizedQuestions.map((question, index) => (
        <article key={index}>
          <label className="field">
            Question {index + 1}
            <div className="readonly-bond-question">{question}</div>
          </label>
          <label className="field">
            Your answer
            <textarea
              rows={2}
              maxLength={180}
              value={normalizedAnswers[index]}
              onChange={(event) => patchAnswer(index, event.target.value)}
              placeholder="Answer honestly—the contrast makes the result special."
            />
            <small>{normalizedAnswers[index].length}/180</small>
          </label>
        </article>
      ))}
    </div>
  );
}

function ResponseInbox({
  giftId,
  blockId,
  title,
}: {
  giftId?: string;
  blockId: string;
  title: string;
}) {
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [loading, setLoading] = useState(false);
  async function load() {
    if (!giftId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${api}/api/public/gifts/${giftId}/responses?blockId=${blockId}`,
        { headers: await authHeaders() },
      );
      if (response.ok) setResponses(await response.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!giftId) return;
    const controller = new AbortController();
    void authHeaders()
      .then((headers) =>
        fetch(
          `${api}/api/public/gifts/${giftId}/responses?blockId=${blockId}`,
          {
            signal: controller.signal,
            headers,
          },
        ),
      )
      .then((response) => (response.ok ? response.json() : []))
      .then(setResponses)
      .catch(() => {});
    return () => controller.abort();
  }, [giftId, blockId]);
  if (!giftId)
    return (
      <div className="response-inbox empty">
        <strong>{title}</strong>
        <span>Save the draft first to start collecting responses.</span>
      </div>
    );
  return (
    <div className="response-inbox">
      <header>
        <strong>{title}</strong>
        <button onClick={load}>{loading ? "Checking…" : "Refresh"}</button>
      </header>
      {responses.length === 0 ? (
        <p>No responses yet. They’ll appear here after someone submits.</p>
      ) : (
        responses.map((response) => (
          <article key={response.id}>
            <small>{response.contributorName}</small>
            <strong>{response.responseText}</strong>
          </article>
        ))
      )}
    </div>
  );
}

function GroupBoardEditor({
  config,
  giftId,
  onConfig,
}: {
  config: Record<string, string>;
  giftId?: string;
  onConfig: Props["onConfig"];
}) {
  const notes = parse<BoardNote[]>(config.boardNotes, [
    { from: "Someone who loves you", message: "You make every room warmer." },
  ]).slice(0, 12);
  const update = (next: BoardNote[]) =>
    onConfig("boardNotes", JSON.stringify(next.slice(0, 12)));
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteError, setInviteError] = useState("");
  async function createInvite() {
    if (!giftId) return;
    setCreating(true);
    setInviteError("");
    try {
      const response = await fetch(
        `${api}/api/gifts/${giftId}/contribution-invites`,
        { method: "POST", headers: await authHeaders() },
      );
      if (!response.ok) throw new Error();
      const invite = await response.json();
      setLink(`${window.location.origin}/?contribute=${invite.token}`);
      setCopied(false);
    } catch {
      setInviteError("Couldn’t create the link. Save the draft and try again.");
    } finally {
      setCreating(false);
    }
  }
  async function shareRoom(target: "native" | "instagram") {
    if (!link) return;
    const shareData = {
      title: "Add your message to our mypookie surprise",
      text: "Leave a message, memory or photo for the group surprise ♡",
      url: link,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    if (target === "instagram") window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }
  return (
    <Section
      title="Group Message Board"
      hint="One reusable room link for everyone you invite"
    >
      {giftId ? (
        <div className="contributor-link single-use">
          <small>ONE ROOM · MANY PEOPLE · ONE MESSAGE EACH</small>
          {link ? (
            <>
              <div>
                <input readOnly value={link} />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
              <div className="contribution-share-row">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Add your message to our surprise ♡ ${link}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                <button onClick={() => void shareRoom("instagram")}>Instagram</button>
                <button onClick={() => void shareRoom("native")}>Share…</button>
              </div>
            </>
          ) : (
            <button
              className="create-invite"
              onClick={createInvite}
              disabled={creating}
            >
              {creating
                ? "Creating secure link…"
                : "Create shared contribution room →"}
            </button>
          )}
          <p>
            Share this same link with everyone. After someone submits, it closes
            only on their browser and stays open for the rest of the group.
          </p>
          {inviteError && <output>{inviteError}</output>}
        </div>
      ) : (
        <div className="response-inbox empty">
          <strong>Shared contribution room</strong>
          <span>
            Save the draft first, then create one link for everyone.
          </span>
        </div>
      )}
      <ResponseInbox
        giftId={giftId}
        blockId="groupboard"
        title="Messages received"
      />
      <details className="manual-board-notes">
        <summary>Add starter messages yourself</summary>
        <div className="board-note-editor">
          {notes.map((note, index) => (
            <article key={index}>
              <header>
                <strong>Note {index + 1}</strong>
                <button
                  disabled={notes.length === 1}
                  onClick={() =>
                    update(notes.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  Remove
                </button>
              </header>
              <label className="field">
                From
                <input
                  maxLength={35}
                  value={note.from}
                  onChange={(event) =>
                    update(
                      notes.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, from: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                Message
                <textarea
                  rows={3}
                  maxLength={100}
                  value={note.message}
                  onChange={(event) =>
                    update(
                      notes.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, message: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <small>{note.message.length}/100</small>
              </label>
            </article>
          ))}
        </div>
        <button
          className="add-collection-item"
          disabled={notes.length >= 12}
          onClick={() => update([...notes, { from: "", message: "" }])}
        >
          ＋ Add a starter message
        </button>
      </details>
    </Section>
  );
}

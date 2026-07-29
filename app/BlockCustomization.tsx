"use client";

import { useEffect, useRef, useState } from "react";

type CustomBlock = {
  id: string;
  message: string;
  config?: Record<string, string>;
};

export function BlockCustomization({ block, onMessage, onConfig }: { block: CustomBlock; onMessage: (value: string) => void; onConfig: (key: string, value: string) => void }) {
  const config = block.config || {};

  function imageUpload(key: string, nameKey: string, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onConfig(key, URL.createObjectURL(file));
    onConfig(nameKey, files && files.length > 1 ? `${files.length} photos selected` : file.name);
  }

  if (block.id === "letter") return <CustomizationSection title="Letter content" hint="Written inside the animated letter">
    <label className="field">Letter message<textarea rows={4} maxLength={100} value={block.message.slice(0,100)} onChange={event=>onMessage(event.target.value)} placeholder="Write a short, meaningful note…" /><small>{Math.min(block.message.length,100)}/100</small></label>
    <label className="field">Sign-off<input maxLength={40} value={config.signoff || ""} onChange={event=>onConfig("signoff",event.target.value)} placeholder="— sent with love" /></label>
    <label className="field">Opening animation<select value={config.animation} onChange={event=>onConfig("animation",event.target.value)}><option>Lift and unfold</option><option>Wax seal pop</option><option>Soft fade</option></select></label>
  </CustomizationSection>;

  if (block.id === "voice") return <CustomizationSection title="Voice note" hint="Only the recording is delivered">
    <VoiceRecorder audioName={config.audioName} onConfig={onConfig} />
    <label className="field">Player style<select value={config.playbackStyle} onChange={event=>onConfig("playbackStyle",event.target.value)}><option>Classic waveform</option><option>Floating heart</option><option>Minimal player</option></select></label>
  </CustomizationSection>;

  if (block.id === "flowers") return <CustomizationSection title="Bouquet details" hint="Choose the flowers and their note">
    <label className="field">Flower style<select value={config.flowerStyle} onChange={event=>onConfig("flowerStyle",event.target.value)}><option>Blush tulips</option><option>Wildflower garden</option><option>Classic red roses</option></select></label>
    <label className="field">Bouquet note<textarea rows={3} maxLength={80} value={config.flowerNote || ""} onChange={event=>onConfig("flowerNote",event.target.value)} /><small>{(config.flowerNote || "").length}/80</small></label>
    <label className="field">Falling animation<select value={config.fallAnimation} onChange={event=>onConfig("fallAnimation",event.target.value)}><option>Soft petals</option><option>Flower shower</option><option>Bloom only</option></select></label>
  </CustomizationSection>;

  if (block.id === "quiz") return <CustomizationSection title="Quiz logic" hint="Set the question, answers and behaviour">
    <label className="field">Question<input maxLength={90} value={config.question || ""} onChange={event=>onConfig("question",event.target.value)} /></label>
    <label className="field">Desired answer<input maxLength={55} value={config.answer1 || ""} onChange={event=>onConfig("answer1",event.target.value)} /></label>
    <label className="field">Other answer<input maxLength={55} value={config.answer2 || ""} onChange={event=>onConfig("answer2",event.target.value)} /></label>
    <label className="field">Interaction<select value={config.interaction} onChange={event=>onConfig("interaction",event.target.value)}><option>Wrong answer floats away</option><option>Normal answers + score</option></select></label>
  </CustomizationSection>;

  if (block.id === "wheel") return <CustomizationSection title="Wheel setup" hint="One prize per line, up to six">
    <label className="field">Prize list<textarea rows={6} value={config.prizes || ""} onChange={event=>onConfig("prizes",event.target.value.split("\n").slice(0,6).join("\n"))} /><small>{(config.prizes || "").split("\n").filter(Boolean).length}/6</small></label>
    <label className="field">Allowed spins<select value={config.spins} onChange={event=>onConfig("spins",event.target.value)}><option>1</option><option>2</option><option>3</option></select></label>
    <label className="field">Prize reveal<select value={config.revealAnimation} onChange={event=>onConfig("revealAnimation",event.target.value)}><option>Confetti burst</option><option>Petal shower</option><option>Golden glow</option></select></label>
  </CustomizationSection>;

  if (block.id === "puzzle") return <CustomizationSection title="Photo puzzle" hint="Upload the photo they will rebuild">
    <UploadBox label="Choose puzzle photo" note={config.imageName || "JPG or PNG from your gallery"} accept="image/*" onFiles={files=>imageUpload("imageUrl","imageName",files)} />
    <label className="field">Difficulty<select value={config.difficulty} onChange={event=>onConfig("difficulty",event.target.value)}><option>3 × 3 · Sweet and simple</option><option>4 × 4 · A little challenge</option><option>5 × 5 · Puzzle lover</option></select></label>
    <label className="field">Success message<input maxLength={70} value={config.successMessage || ""} onChange={event=>onConfig("successMessage",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "memory") return <CustomizationSection title="Memory lane" hint="Add photos, captions and dates">
    <UploadBox label="Add photos" note={config.imageName || "Choose one or multiple memories"} accept="image/*" multiple onFiles={files=>imageUpload("imageUrl","imageName",files)} />
    <label className="field">Photo caption<input maxLength={60} value={config.caption || ""} onChange={event=>onConfig("caption",event.target.value)} /></label>
    <label className="field">Date or little detail<input maxLength={45} value={config.date || ""} onChange={event=>onConfig("date",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "scratch") return <CustomizationSection title="Hidden reveal" hint="Choose exactly what appears underneath">
    <label className="field">Hidden surprise<input maxLength={65} value={config.revealText || ""} onChange={event=>onConfig("revealText",event.target.value)} /></label>
    <label className="field">Extra detail<input maxLength={50} value={config.revealDetail || ""} onChange={event=>onConfig("revealDetail",event.target.value)} /></label>
    <label className="field">Scratch coating<select value={config.coating} onChange={event=>onConfig("coating",event.target.value)}><option>Lilac shimmer</option><option>Rose gold</option><option>Silver sparkle</option></select></label>
  </CustomizationSection>;

  if (block.id === "treasure") return <CustomizationSection title="Treasure hunt" hint="One clue per line, revealed in order">
    <label className="field">Clues<textarea rows={6} value={config.clues || ""} onChange={event=>onConfig("clues",event.target.value.split("\n").slice(0,8).join("\n"))} /><small>{(config.clues || "").split("\n").filter(Boolean).length}/8</small></label>
    <label className="field">Final surprise<input maxLength={70} value={config.finalSurprise || ""} onChange={event=>onConfig("finalSurprise",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "calendar") return <CustomizationSection title="Unlock calendar" hint="Decide its length and first daily moment">
    <label className="field">Number of days<select value={config.days} onChange={event=>onConfig("days",event.target.value)}><option>7</option><option>14</option><option>30</option></select></label>
    <label className="field">Unlock schedule<select value={config.unlockRule} onChange={event=>onConfig("unlockRule",event.target.value)}><option>One per day</option><option>Recipient can open anytime</option><option>Sender chooses dates</option></select></label>
    <label className="field">Day one message<textarea rows={3} maxLength={90} value={config.firstNote || ""} onChange={event=>onConfig("firstNote",event.target.value)} /><small>{(config.firstNote || "").length}/90</small></label>
  </CustomizationSection>;

  return <CustomizationSection title="Gift card" hint="Add the actual voucher details">
    <label className="field">Brand or gift name<input maxLength={40} value={config.brand || ""} onChange={event=>onConfig("brand",event.target.value)} /></label>
    <label className="field">Code or redemption link<input maxLength={80} value={config.code || ""} onChange={event=>onConfig("code",event.target.value)} /></label>
    <label className="field">Value<input maxLength={20} value={config.value || ""} onChange={event=>onConfig("value",event.target.value)} /></label>
    <label className="field">Gift message<textarea rows={3} maxLength={90} value={config.giftMessage || ""} onChange={event=>onConfig("giftMessage",event.target.value)} /><small>{(config.giftMessage || "").length}/90</small></label>
  </CustomizationSection>;
}

function CustomizationSection({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return <section className="dedicated-customization"><div className="dedicated-title"><strong>{title}</strong><span>{hint}</span></div>{children}</section>;
}

function UploadBox({ label, note, accept, multiple, onFiles }: { label: string; note: string; accept: string; multiple?: boolean; onFiles: (files: FileList | null) => void }) {
  return <label className="upload dedicated-upload">▧<strong>{label}</strong><span>{note}</span><input type="file" accept={accept} multiple={multiple} onChange={event=>onFiles(event.target.files)} /></label>;
}

function VoiceRecorder({ audioName, onConfig }: { audioName?: string; onConfig: (key: string, value: string) => void }) {
  const [status, setStatus] = useState<"idle"|"recording"|"ready"|"error">("idle");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
    recorder.current?.stream.getTracks().forEach(track=>track.stop());
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.ondataavailable = event => event.data.size && chunks.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
        onConfig("audioUrl", URL.createObjectURL(blob));
        onConfig("audioName", `Recorded voice note · ${seconds || 1}s`);
        stream.getTracks().forEach(track=>track.stop());
        setStatus("ready");
      };
      recorder.current = mediaRecorder;
      mediaRecorder.start();
      setSeconds(0);
      setStatus("recording");
      timer.current = window.setInterval(()=>setSeconds(value=>value+1),1000);
    } catch {
      setStatus("error");
    }
  }

  function stop() {
    recorder.current?.stop();
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }

  function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onConfig("audioUrl", URL.createObjectURL(file));
    onConfig("audioName", file.name);
    setStatus("ready");
  }

  return <div className="voice-recorder">
    {status==="recording"?<button className="record recording" onClick={stop}>■ Stop recording <span>{seconds}s recorded</span></button>:<button className="record" onClick={start}>● Record voice note <span>{audioName || "Tap to allow microphone access"}</span></button>}
    <label className="audio-upload">or upload audio<input type="file" accept="audio/*" onChange={event=>upload(event.target.files)} /></label>
    {status==="error"&&<p>Microphone permission was not available. Upload an audio file instead.</p>}
  </div>;
}

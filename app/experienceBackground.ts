import type { CSSProperties } from "react";

export type ExperienceBackground = {
  theme: string;
  imageUrl: string;
  overlay: string;
};
export const defaultExperienceBackground: ExperienceBackground = {
  theme: "Theme glow",
  imageUrl: "",
  overlay: "Soft",
};

export function experienceBackgroundStyle(
  background?: Partial<ExperienceBackground>,
): CSSProperties {
  const theme = background?.theme || "Theme glow";
  const overlay = background?.overlay || "Soft";
  const image = background?.imageUrl;
  const tint =
    overlay === "Strong"
      ? "rgba(255,246,249,.78)"
      : overlay === "None"
        ? "rgba(255,255,255,0)"
        : "rgba(255,248,250,.48)";
  const presets: Record<string, string> = {
    "Theme glow": "radial-gradient(circle at 50% 36%,#fff,#f7dce5 68%,#edcfda)",
    "Rose clouds":
      "radial-gradient(circle at 16% 25%,#ffdce7,transparent 32%),radial-gradient(circle at 84% 70%,#e5dcff,transparent 35%),#fff7fa",
    "Golden hour":
      "radial-gradient(circle at 20% 20%,#fff3bf,transparent 34%),linear-gradient(145deg,#fffaf0,#f4d6c5)",
    "Midnight stars":
      "radial-gradient(circle at 20% 25%,#675a86,transparent 30%),radial-gradient(circle at 80% 65%,#6f3658,transparent 34%),#181322",
    "Paper garden":
      "linear-gradient(rgba(255,250,246,.86),rgba(255,250,246,.86)),url('/mypookie-occasions.png') center/cover",
  };
  return {
    backgroundColor: theme === "Midnight stars" ? "#181322" : "#fff7fa",
    backgroundImage: image
      ? `linear-gradient(${tint},${tint}),url("${image}")`
      : presets[theme] || presets["Theme glow"],
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  };
}

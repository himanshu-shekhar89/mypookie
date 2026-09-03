"use client";

import { useEffect, useRef, useState } from "react";

const colors = ["#3f2038", "#d52f62", "#ff7d74", "#f6c453", "#4fae78", "#4d83d1", "#8c63c7", "#ffffff", "#111111"];

export function DrawingCanvas({ initial = "", onSave, saveLabel = "Save my drawing" }: { initial?: string; onSave: (image: string) => void; saveLabel?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(colors[0]);
  const [tool, setTool] = useState<"draw" | "fill">("draw");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fffaf4";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (initial) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = initial;
    }
  }, [initial]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const box = canvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * canvas.width, y: ((event.clientY - box.top) / box.height) * canvas.height };
  }
  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (tool === "fill") {
      fillClosedArea(event);
      return;
    }
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    const context = event.currentTarget.getContext("2d")!;
    context.beginPath(); context.moveTo(p.x, p.y);
  }
  function fillClosedArea(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d")!;
    const { x, y } = point(event);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    const startX = Math.max(0, Math.min(canvas.width - 1, Math.floor(x)));
    const startY = Math.max(0, Math.min(canvas.height - 1, Math.floor(y)));
    const startIndex = (startY * canvas.width + startX) * 4;
    const target = [pixels[startIndex], pixels[startIndex + 1], pixels[startIndex + 2]];
    const replacement = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
    if (target.every((value, index) => Math.abs(value - replacement[index]) < 8)) return;
    const matches = (pixel: number) => Math.abs(pixels[pixel] - target[0]) + Math.abs(pixels[pixel + 1] - target[1]) + Math.abs(pixels[pixel + 2] - target[2]) < 70;
    const queue = new Uint32Array(canvas.width * canvas.height);
    const visited = new Uint8Array(canvas.width * canvas.height);
    let head = 0, tail = 0;
    queue[tail++] = startY * canvas.width + startX;
    visited[startY * canvas.width + startX] = 1;
    while (head < tail) {
      const position = queue[head++];
      const pixel = position * 4;
      if (!matches(pixel)) continue;
      pixels[pixel] = replacement[0]; pixels[pixel + 1] = replacement[1]; pixels[pixel + 2] = replacement[2]; pixels[pixel + 3] = 255;
      const px = position % canvas.width;
      for (const neighbor of [px > 0 ? position - 1 : -1, px < canvas.width - 1 ? position + 1 : -1, position >= canvas.width ? position - canvas.width : -1, position < canvas.width * (canvas.height - 1) ? position + canvas.width : -1]) {
        if (neighbor >= 0 && !visited[neighbor]) { visited[neighbor] = 1; queue[tail++] = neighbor; }
      }
    }
    context.putImageData(image, 0, 0);
  }
  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = point(event);
    const context = event.currentTarget.getContext("2d")!;
    context.strokeStyle = color; context.lineWidth = 7; context.lineCap = "round"; context.lineJoin = "round";
    context.lineTo(p.x, p.y); context.stroke();
  }
  function clear() {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#fffaf4"; context.fillRect(0, 0, canvas.width, canvas.height);
  }
  function fill() {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  return <div className="drawing-canvas-tool">
    <canvas ref={canvasRef} width={720} height={560} onPointerDown={start} onPointerMove={move} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} />
    <div className="drawing-palette" aria-label="Drawing colours">
      {colors.map(value => <button key={value} className={color === value ? "active" : ""} style={{ background: value }} onClick={() => setColor(value)} aria-label={`Use ${value}`} />)}
    </div>
    <div className="drawing-tools"><button className={tool === "draw" ? "active" : ""} onClick={() => setTool("draw")}>✎ Draw</button><button className={tool === "fill" ? "active" : ""} onClick={() => setTool("fill")}>◉ Fill closed area</button></div>
    <div className="drawing-actions"><button onClick={clear}>Clear</button><button onClick={fill}>Fill page</button><button className="primary" onClick={() => onSave(canvasRef.current!.toDataURL("image/webp", .82))}>{saveLabel}</button></div>
  </div>;
}

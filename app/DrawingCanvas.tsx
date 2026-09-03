"use client";

import { useEffect, useRef, useState } from "react";

const colors = ["#3f2038", "#d52f62", "#ff7d74", "#f6c453", "#4fae78", "#4d83d1", "#8c63c7", "#ffffff", "#111111"];

export function DrawingCanvas({ initial = "", onSave, saveLabel = "Save my drawing" }: { initial?: string; onSave: (image: string) => void; saveLabel?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(colors[0]);

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
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    const context = event.currentTarget.getContext("2d")!;
    context.beginPath(); context.moveTo(p.x, p.y);
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
    <div className="drawing-actions"><button onClick={clear}>Clear</button><button onClick={fill}>Fill page</button><button className="primary" onClick={() => onSave(canvasRef.current!.toDataURL("image/webp", .82))}>{saveLabel}</button></div>
  </div>;
}

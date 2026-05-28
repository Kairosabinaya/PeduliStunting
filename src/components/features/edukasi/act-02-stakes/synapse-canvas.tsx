"use client";

// Canvas-driven synapse animation. Renders ~80 drifting neuron dots; once
// the canvas is in view, adjacent dots within `connectionDistance` get
// drawn as faint lines, simulating the "synapse forming" visual that
// supports the 700–1.000 connections-per-second narrative.
//
// Honors `prefers-reduced-motion` (drops to a static frame) and clamps
// to 30 FPS to limit CPU cost on mid-range Android phones.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const NEURON_COUNT = 64;
const CONNECTION_DISTANCE = 90;
const TARGET_FPS = 30;
const MIN_FRAME_MS = 1000 / TARGET_FPS;
const DRIFT_SPEED = 0.18;

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function seedNeurons(width: number, height: number): Neuron[] {
  return Array.from({ length: NEURON_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * DRIFT_SPEED,
    vy: (Math.random() - 0.5) * DRIFT_SPEED,
  }));
}

function readToken(name: string): string {
  if (typeof window === "undefined") return "9 95 150";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value.length > 0 ? value : "9 95 150";
}

export interface SynapseCanvasProps {
  /** Optional class merged onto the canvas wrapper. */
  readonly className?: string;
  readonly ariaLabel: string;
}

export function SynapseCanvas({ className, ariaLabel }: SynapseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let neurons = seedNeurons(width, height);
    const primary = readToken("--color-primary");
    const accent = readToken("--color-accent");

    function drawFrame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      // Connections
      for (let i = 0; i < neurons.length; i += 1) {
        const a = neurons[i];
        if (!a) continue;
        for (let j = i + 1; j < neurons.length; j += 1) {
          const b = neurons[j];
          if (!b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.35;
            ctx.strokeStyle = `rgb(${primary} / ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // Neurons
      for (let i = 0; i < neurons.length; i += 1) {
        const n = neurons[i];
        if (!n) continue;
        const useAccent = i % 4 === 0;
        ctx.fillStyle = `rgb(${useAccent ? accent : primary} / 0.85)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, useAccent ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (let i = 0; i < neurons.length; i += 1) {
        const n = neurons[i];
        if (!n) continue;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
    }

    let rafId = 0;
    let lastFrame = 0;
    function tick(now: number) {
      if (now - lastFrame >= MIN_FRAME_MS) {
        step();
        drawFrame();
        lastFrame = now;
      }
      rafId = requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      // One-off static frame.
      drawFrame();
    } else {
      rafId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      neurons = seedNeurons(width, height);
      drawFrame();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  );
}

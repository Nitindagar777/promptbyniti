import React, { useEffect, useRef } from 'react';
import './QuantumReactor.css';

export default function QuantumReactor() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, isOver: false });

  // Physics animation states (optimized in refs to prevent React lifecycle overhead)
  const stateRef = useRef({
    fusionState: 'STABLE', // 'STABLE' | 'COLLIDING' | 'EXPLODING'
    fusionTimer: 0,
    speedMultiplier: 1.0,
    orbitRadiusScale: 1.0,
    nucleusGlow: 25,
    nucleusRadius: 28,
    // 4 Orbits (each has 2 electrons with fast RGB color accessors)
    electrons: [
      { phi: 0, a: 160, b: 65, tilt: 0.8, theta: -0.5, speed: 0.022, size: 5.5, rgb: [56, 189, 248], trail: [] },
      { phi: Math.PI, a: 160, b: 65, tilt: 0.8, theta: -0.5, speed: 0.022, size: 4.5, rgb: [56, 189, 248], trail: [] },
      
      { phi: Math.PI / 3, a: 140, b: 55, tilt: -0.9, theta: 0.4, speed: 0.030, size: 5.0, rgb: [249, 115, 22], trail: [] },
      { phi: Math.PI * 1.3, a: 140, b: 55, tilt: -0.9, theta: 0.4, speed: 0.030, size: 4.0, rgb: [249, 115, 22], trail: [] },
      
      { phi: Math.PI * 0.7, a: 175, b: 60, tilt: 1.2, theta: 1.3, speed: 0.018, size: 6.0, rgb: [168, 85, 247], trail: [] },
      { phi: Math.PI * 1.7, a: 175, b: 60, tilt: 1.2, theta: 1.3, speed: 0.018, size: 4.2, rgb: [168, 85, 247], trail: [] },
      
      { phi: Math.PI * 0.25, a: 150, b: 50, tilt: 0.5, theta: -1.1, speed: 0.026, size: 4.8, rgb: [253, 224, 71], trail: [] },
      { phi: Math.PI * 1.25, a: 150, b: 50, tilt: 0.5, theta: -1.1, speed: 0.026, size: 3.8, rgb: [253, 224, 71], trail: [] }
    ],
    // Swarming core particles (Reduced to 45 with optimized N(N-1)/2 mesh calculations)
    nucleusParticles: Array.from({ length: 45 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 24;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.8,
        vx: 0,
        vy: 0,
        size: 1.2 + Math.random() * 2.8,
        rgb: Math.random() > 0.45 
          ? [249, 115, 22] // Orange
          : (Math.random() > 0.5 
              ? [56, 189, 248] // Cyan
              : [253, 224, 71] // Gold
            )
      };
    }),
    // Drifting background stars
    ambientParticles: Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.5) * 450,
      size: 0.6 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.35,
      speed: 0.1 + Math.random() * 0.3,
      angle: Math.random() * Math.PI * 2
    })),
    explosionSparks: []
  });

  const handleCanvasClick = () => {
    const s = stateRef.current;
    if (s.fusionState !== 'STABLE') return;

    s.fusionState = 'COLLIDING';
    s.fusionTimer = 120;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    let isIntersecting = false;

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      mouseRef.current.isOver = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isOver = false;
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      if (!isIntersecting) return;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const s = stateRef.current;
      const mouse = mouseRef.current;

      // 1. Process active fusion state machines
      if (s.fusionState === 'COLLIDING') {
        s.fusionTimer--;
        const progress = (120 - s.fusionTimer) / 120;
        s.speedMultiplier = 1.0 + progress * 5.0;
        s.orbitRadiusScale = 1.0 - progress * 0.88;
        s.nucleusRadius = 28 + progress * 12;
        s.nucleusGlow = 25 + progress * 40;

        if (s.fusionTimer <= 0) {
          s.fusionState = 'EXPLODING';
          s.fusionTimer = 75;
          s.explosionSparks = Array.from({ length: 85 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2.5 + Math.random() * 8.5;
            const r = Math.random();
            return {
              x: 0,
              y: 0,
              vx: Math.cos(angle) * velocity,
              vy: Math.sin(angle) * velocity,
              size: 1.0 + Math.random() * 2.8,
              alpha: 1.0,
              decay: 0.015 + Math.random() * 0.018,
              color: r > 0.4 ? '#f97316' : (r > 0.5 ? '#38bdf8' : '#a855f7')
            };
          });
        }
      } else if (s.fusionState === 'EXPLODING') {
        s.fusionTimer--;
        const factor = (75 - s.fusionTimer) / 75;
        s.speedMultiplier = 6.0 - factor * 5.0;
        s.orbitRadiusScale = 0.12 + factor * 0.88;
        s.nucleusRadius = 40 - factor * 12;
        s.nucleusGlow = 65 - factor * 40;

        if (s.fusionTimer <= 0) {
          s.fusionState = 'STABLE';
          s.speedMultiplier = 1.0;
          s.orbitRadiusScale = 1.0;
          s.nucleusRadius = 28;
          s.nucleusGlow = 25;
          s.explosionSparks = [];
        }
      } else {
        if (mouse.isOver) {
          s.speedMultiplier = s.speedMultiplier * 0.95 + 1.65 * 0.05;
        } else {
          s.speedMultiplier = s.speedMultiplier * 0.95 + 1.0 * 0.05;
        }
      }

      // 2. Draw drifting background stars (faint)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      s.ambientParticles.forEach(p => {
        p.angle += 0.002 * p.speed;
        const ax = cx + p.x + Math.cos(p.angle) * 12;
        const ay = cy + p.y + Math.sin(p.angle) * 12;
        ctx.moveTo(ax + p.size, ay);
        ctx.arc(ax, ay, p.size, 0, Math.PI * 2);
      });
      ctx.fill();

      // 3. Draw Orbit Rings Behind Core (Back half) - unique orbits only
      for (let i = 0; i < s.electrons.length; i += 2) {
        const el = s.electrons[i];
        drawOrbitRingHalf(ctx, cx, cy, el.a * s.orbitRadiusScale, el.b * s.orbitRadiusScale, el.tilt, el.theta, el.rgb, false);
      }

      // 4. Draw Plasma Core Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, s.nucleusRadius * 2.6);
      glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
      glowGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.12)');
      glowGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, s.nucleusRadius * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // 5. Build Draw List for Z-depth Sorting
      const drawList = [];

      // Add Plasma Core Core
      drawList.push({
        z: 0,
        draw: () => {
          const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.nucleusRadius);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.25, '#fef08a');
          coreGrad.addColorStop(0.65, '#f97316');
          coreGrad.addColorStop(1, 'rgba(249, 115, 22, 0.15)');

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, s.nucleusRadius, 0, Math.PI * 2);
          ctx.fill();

          // Swarming Core Physics (Chaotic) & Batch rendering by color
          const groups = {
            orange: { rgb: [249, 115, 22], particles: [] },
            cyan: { rgb: [56, 189, 248], particles: [] },
            gold: { rgb: [253, 224, 71], particles: [] }
          };

          s.nucleusParticles.forEach(p => {
            const dist = Math.hypot(p.x, p.y);
            const spring = 0.007;
            p.vx -= p.x * spring;
            p.vy -= p.y * spring;

            const jitter = 0.24;
            p.vx += (Math.random() - 0.5) * jitter;
            p.vy += (Math.random() - 0.5) * jitter;

            const swirl = 0.014;
            if (dist > 0) {
              p.vx += (-p.y / dist) * swirl;
              p.vy += (p.x / dist) * swirl;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.94;
            p.vy *= 0.94;

            if (p.rgb[0] === 249) groups.orange.particles.push(p);
            else if (p.rgb[0] === 56) groups.cyan.particles.push(p);
            else groups.gold.particles.push(p);
          });

          // Draw each color group in a single batched path
          Object.values(groups).forEach(g => {
            if (g.particles.length === 0) return;
            ctx.fillStyle = 'rgba(' + g.rgb[0] + ',' + g.rgb[1] + ',' + g.rgb[2] + ',0.85)';
            ctx.beginPath();
            g.particles.forEach(p => {
              const px = cx + p.x;
              const py = cy + p.y;
              ctx.moveTo(px + p.size, py);
              ctx.arc(px, py, p.size, 0, Math.PI * 2);
            });
            ctx.fill();
          });

          // Draw connection links in a single batched path
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.06)';
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          const particles = s.nucleusParticles;
          const len = particles.length;
          for (let i = 0; i < len; i++) {
            const p = particles[i];
            const px = cx + p.x;
            const py = cy + p.y;
            for (let j = i + 1; j < len; j++) {
              const other = particles[j];
              const ox = cx + other.x;
              const oy = cy + other.y;
              const dx = px - ox;
              const dy = py - oy;
              const distSq = dx * dx + dy * dy;
              
              if (distSq < 400) {
                ctx.moveTo(px, py);
                ctx.lineTo(ox, oy);
              }
            }
          }
          ctx.stroke();
        }
      });

      // Update and Draw Orbiting Electrons
      s.electrons.forEach(el => {
        el.phi += el.speed * s.speedMultiplier;

        const cosP = Math.cos(el.phi);
        const sinP = Math.sin(el.phi);
        const xp = el.a * cosP * s.orbitRadiusScale;
        const yp = el.b * sinP * Math.cos(el.tilt) * s.orbitRadiusScale;
        const zp = el.b * sinP * Math.sin(el.tilt) * s.orbitRadiusScale;

        let rx = xp * Math.cos(el.theta) - yp * Math.sin(el.theta);
        let ry = xp * Math.sin(el.theta) + yp * Math.cos(el.theta);

        if (mouse.isOver && mouse.x !== null) {
          const dx = mouse.x - (cx + rx);
          const dy = mouse.y - (cy + ry);
          const distToMouseSq = dx * dx + dy * dy;
          if (distToMouseSq < 25600 && distToMouseSq > 25) { // 160^2 = 25600
            const distToMouse = Math.sqrt(distToMouseSq);
            const pullFactor = (160 - distToMouse) / 160 * 0.22;
            rx += dx * pullFactor;
            ry += dy * pullFactor;
          }
        }

        const x = cx + rx;
        const y = cy + ry;

        el.trail.push({ x, y, z: zp });
        if (el.trail.length > 22) el.trail.shift();

        drawList.push({
          z: zp,
          draw: () => {
            // Draw Electron Trail (Optimized batched 2-stage draw)
            if (el.trail.length > 1) {
              const tLen = el.trail.length;
              const mid = Math.floor(tLen / 2);
              
              // Older part (fainter, thinner)
              ctx.beginPath();
              ctx.moveTo(el.trail[0].x, el.trail[0].y);
              for (let i = 1; i <= mid; i++) {
                ctx.lineTo(el.trail[i].x, el.trail[i].y);
              }
              ctx.strokeStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',0.12)';
              ctx.lineWidth = el.size * 0.35;
              ctx.stroke();

              // Newer part (brighter, thicker)
              ctx.beginPath();
              ctx.moveTo(el.trail[mid].x, el.trail[mid].y);
              for (let i = mid + 1; i < tLen; i++) {
                ctx.lineTo(el.trail[i].x, el.trail[i].y);
              }
              ctx.strokeStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',0.38)';
              ctx.lineWidth = el.size * 0.65;
              ctx.stroke();
            }

            const maxRadius = el.b * s.orbitRadiusScale;
            const normDepth = maxRadius > 0 ? (zp + maxRadius) / (2 * maxRadius) : 0.5;
            const activeSize = el.size * (0.75 + normDepth * 0.45);

            // Draw a high-performance faint glow circle around the electron (replaces slow shadowBlur)
            ctx.fillStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',0.22)';
            ctx.beginPath();
            ctx.arc(x, y, activeSize * 2.8, 0, Math.PI * 2);
            ctx.fill();

            // Core electron circle
            ctx.fillStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',1)';
            ctx.beginPath();
            ctx.arc(x, y, activeSize, 0, Math.PI * 2);
            ctx.fill();

            if (s.fusionState === 'COLLIDING') {
              ctx.strokeStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',' + (0.15 + Math.random() * 0.45) + ')';
              ctx.lineWidth = 1.0 + Math.random() * 2.2;
              ctx.beginPath();
              ctx.moveTo(x, y);
              const segments = 4;
              for (let k = 1; k <= segments; k++) {
                const t = k / segments;
                const tx = x + (cx - x) * t + (Math.random() - 0.5) * 15 * (1 - t);
                const ty = y + (cy - y) * t + (Math.random() - 0.5) * 15 * (1 - t);
                ctx.lineTo(tx, ty);
              }
              ctx.stroke();
            }

            if (mouse.isOver && mouse.x !== null) {
              const dx = mouse.x - x;
              const dy = mouse.y - y;
              const cursorDistSq = dx * dx + dy * dy;
              if (cursorDistSq < 14400) { // 120^2 = 14400
                const cursorDist = Math.sqrt(cursorDistSq);
                ctx.strokeStyle = 'rgba(' + el.rgb[0] + ',' + el.rgb[1] + ',' + el.rgb[2] + ',' + (0.12 * (1.0 - cursorDist / 120)) + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
              }
            }
          }
        });
      });

      // Sparks (Top Z)
      if (s.fusionState === 'EXPLODING' && s.explosionSparks.length > 0) {
        s.explosionSparks.forEach(spark => {
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.vx *= 0.955;
          spark.vy *= 0.955;
          spark.alpha -= spark.decay;

          if (spark.alpha > 0) {
            drawList.push({
              z: 2000,
              draw: () => {
                ctx.fillStyle = spark.color;
                ctx.globalAlpha = spark.alpha;
                ctx.beginPath();
                ctx.arc(cx + spark.x, cy + spark.y, spark.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
              }
            });
          }
        });
      }

      drawList.sort((a, b) => a.z - b.z);
      drawList.forEach(item => item.draw());

      // 6. Draw Unique Orbit Rings in Front of Core (Front half)
      for (let i = 0; i < s.electrons.length; i += 2) {
        const el = s.electrons[i];
        drawOrbitRingHalf(ctx, cx, cy, el.a * s.orbitRadiusScale, el.b * s.orbitRadiusScale, el.tilt, el.theta, el.rgb, true);
      }

      animId = requestAnimationFrame(render);
    };

    const drawOrbitRingHalf = (ctx, cx, cy, a, b, tilt, theta, rgb, drawFront) => {
      ctx.lineWidth = 1.25;
      const segments = 36;
      ctx.beginPath();
      
      let startPath = true;
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2;
        const zp = b * Math.sin(phi) * Math.sin(tilt);
        const isFront = zp >= 0;
        
        if ((drawFront && isFront) || (!drawFront && !isFront)) {
          const xp = a * Math.cos(phi);
          const yp = b * Math.sin(phi) * Math.cos(tilt);
          const x = cx + xp * Math.cos(theta) - yp * Math.sin(theta);
          const y = cy + xp * Math.sin(theta) + yp * Math.cos(theta);

          if (startPath) {
            ctx.moveTo(x, y);
            startPath = false;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          startPath = true;
        }
      }
      
      const baseOpacity = stateRef.current.fusionState === 'COLLIDING' ? 0.035 : 0.05;
      const alpha = drawFront ? (baseOpacity + 0.08) : baseOpacity;
      ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
      ctx.stroke();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasIntersecting = isIntersecting;
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !wasIntersecting) {
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="quantum-reactor" ref={containerRef}>
      <div className="quantum-reactor__canvas-container" onClick={handleCanvasClick}>
        <canvas ref={canvasRef} className="quantum-reactor__canvas" title="Click to accelerate fusion core" />
      </div>
    </div>
  );
}

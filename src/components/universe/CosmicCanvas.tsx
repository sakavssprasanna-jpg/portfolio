import React, { useEffect, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';

interface Particle {
  x: number;
  y: number;
  z: number; // depth 0.2 to 1.5
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  speed: number;
  alpha: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface FloatingCode {
  text: string;
  x: number;
  y: number;
  speed: number;
  alpha: number;
}

export const CosmicCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useUniverse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Generate Star Layers
    const starCount = reducedMotion ? 60 : Math.min(180, Math.floor((width * height) / 8000));
    const stars: Particle[] = [];
    const colors = [
      '#ffffff', 
      '#e0f2fe', 
      '#00f0ff', 
      '#818cf8', 
      '#c084fc', 
      '#38bdf8'
    ];

    for (let i = 0; i < starCount; i++) {
      const z = 0.3 + Math.random() * 1.2;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: (0.8 + Math.random() * 1.8) * z,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: (0.1 + Math.random() * 0.25) * z,
        alpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.02 + Math.random() * 0.04
      });
    }

    // 2. Shooting Stars
    const shootingStars: ShootingStar[] = [];
    const maxShootingStars = 2;
    for (let i = 0; i < maxShootingStars; i++) {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        length: 80 + Math.random() * 60,
        speed: 12 + Math.random() * 8,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 0,
        active: false
      });
    }

    // 3. Floating Math / AI Code fragments
    const mathFormulas = [
      '∇L(θ)',
      'softmax(QKᵀ / √d)',
      'y = σ(Wx + b)',
      'E[log p(x|z)]',
      'cos(u, v) = u·v / (||u|| ||v||)',
      'RAG::retrieve(q, k=5)',
      'Agent.act(trajectory)',
      'CrossEntropy(p, q)',
      'torch.nn.MultiheadAttention',
      'AdamW(lr=1e-4)'
    ];

    const codeTokens: FloatingCode[] = mathFormulas.map((text, idx) => ({
      text,
      x: (width / mathFormulas.length) * idx + (Math.random() * 50 - 25),
      y: Math.random() * height,
      speed: 0.15 + Math.random() * 0.2,
      alpha: 0.12 + Math.random() * 0.08
    }));

    let lastShootingStarTime = Date.now();

    // Render loop
    const render = () => {
      // Smooth mouse parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const offsetX = (mouseX - width / 2) * 0.03;
      const offsetY = (mouseY - height / 2) * 0.03;

      ctx.clearRect(0, 0, width, height);

      // Deep space atmospheric gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5 - offsetX * 0.5,
        height * 0.4 - offsetY * 0.5,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#0a1435');
      bgGrad.addColorStop(0.4, '#050a18');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Nebula clouds
      const drawNebula = (cx: number, cy: number, radius: number, color: string, alpha: number) => {
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        radGrad.addColorStop(0, color);
        radGrad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawNebula(width * 0.2 - offsetX * 0.8, height * 0.3 - offsetY * 0.8, 380, 'rgba(0, 240, 255, 0.08)', 0.5);
      drawNebula(width * 0.8 - offsetX * 0.6, height * 0.6 - offsetY * 0.6, 450, 'rgba(139, 92, 246, 0.09)', 0.6);
      drawNebula(width * 0.5 - offsetX * 0.4, height * 0.8 - offsetY * 0.4, 320, 'rgba(236, 72, 153, 0.05)', 0.4);

      // Deep floating code fragments
      if (!reducedMotion) {
        ctx.font = '11px "JetBrains Mono", monospace';
        codeTokens.forEach(token => {
          token.y -= token.speed;
          if (token.y < -30) token.y = height + 30;
          ctx.fillStyle = `rgba(0, 240, 255, ${token.alpha})`;
          ctx.fillText(token.text, token.x - offsetX * 0.2, token.y - offsetY * 0.2);
        });
      }

      // Draw & Connect Stars (Neural Network Synapses)
      const visibleStars = stars;
      const connectionDist = reducedMotion ? 0 : 90;

      for (let i = 0; i < visibleStars.length; i++) {
        const s = visibleStars[i];

        if (!reducedMotion) {
          s.baseY -= s.speed;
          if (s.baseY < 0) s.baseY = height;
          s.alpha += (Math.random() - 0.5) * s.twinkleSpeed;
          s.alpha = Math.max(0.2, Math.min(0.9, s.alpha));
        }

        const renderX = s.baseX - offsetX * s.z;
        const renderY = s.baseY - offsetY * s.z;

        // Neural connections between nearby nodes
        if (!reducedMotion) {
          for (let j = i + 1; j < visibleStars.length; j++) {
            const s2 = visibleStars[j];
            const s2X = s2.baseX - offsetX * s2.z;
            const s2Y = s2.baseY - offsetY * s2.z;
            const dx = renderX - s2X;
            const dy = renderY - s2Y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
              const lineAlpha = (1 - dist / connectionDist) * 0.18;
              ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(renderX, renderY);
              ctx.lineTo(s2X, s2Y);
              ctx.stroke();
            }
          }

          // Cursor interactive neural attraction
          const mouseDist = Math.hypot(renderX - targetMouseX, renderY - targetMouseY);
          if (mouseDist < 120) {
            const cursorAlpha = (1 - mouseDist / 120) * 0.35;
            ctx.strokeStyle = `rgba(59, 130, 246, ${cursorAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(targetMouseX, targetMouseY);
            ctx.stroke();
          }
        }

        // Draw Star node
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow for larger stars
        if (s.size > 1.8 && !reducedMotion) {
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.25;
          ctx.beginPath();
          ctx.arc(renderX, renderY, s.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Occasional Shooting Stars
      if (!reducedMotion) {
        const now = Date.now();
        if (now - lastShootingStarTime > 4500) {
          const inactive = shootingStars.find(ss => !ss.active);
          if (inactive) {
            inactive.active = true;
            inactive.x = Math.random() * (width * 0.8);
            inactive.y = Math.random() * (height * 0.3);
            inactive.opacity = 1;
            lastShootingStarTime = now;
          }
        }

        shootingStars.forEach(ss => {
          if (!ss.active) return;
          const tailX = ss.x - Math.cos(ss.angle) * ss.length;
          const tailY = ss.y - Math.sin(ss.angle) * ss.length;

          const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
          grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(ss.x, ss.y);
          ctx.stroke();

          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.opacity -= 0.015;

          if (ss.opacity <= 0 || ss.x > width || ss.y > height) {
            ss.active = false;
          }
        });
      }

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};

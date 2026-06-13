import React, { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

const getVehicleEmoji = (type: string) => {
  const m: Record<string, string> = { ambulance: '🚑', truck: '🚚', bus: '🚌', van: '🚐', suv: '🚙', police: '🚓', fire_truck: '🚒', motorcycle: '🏍️' };
  return m[type] || '🚗';
};

const getCongestionColor = (level: number): string => {
  if (level < 30) return '#00ff88';
  if (level < 55) return '#ffaa00';
  if (level < 75) return '#ff6644';
  return '#ff3355';
};

const InteractiveMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const { vehicles, roadSegments, fuelStations, hazards, selectedVehicleId, selectVehicle, showTraffic, showWeather, showHazards, showHeatMap } = useStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;
    const scaleX = W / 800;
    const scaleY = H / 550;

    // Background
    ctx.fillStyle = '#0d0d20';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,240,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Heat map overlay
    if (showHeatMap) {
      roadSegments.forEach(seg => {
        const mx = ((seg.startPoint.x + seg.endPoint.x) / 2) * scaleX;
        const my = ((seg.startPoint.y + seg.endPoint.y) / 2) * scaleY;
        const radius = 50 * scaleX;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
        const intensity = seg.congestionLevel / 100;
        grad.addColorStop(0, `rgba(255, ${Math.round(255 * (1 - intensity))}, 0, ${intensity * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
      });
    }

    // Road segments
    roadSegments.forEach(seg => {
      const x1 = seg.startPoint.x * scaleX;
      const y1 = seg.startPoint.y * scaleY;
      const x2 = seg.endPoint.x * scaleX;
      const y2 = seg.endPoint.y * scaleY;

      // Road shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = (seg.lanes * 5 + 4) * Math.min(scaleX, scaleY);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

      // Road
      const color = showTraffic ? getCongestionColor(seg.congestionLevel) : '#334';
      ctx.strokeStyle = color;
      ctx.lineWidth = (seg.lanes * 5) * Math.min(scaleX, scaleY);
      ctx.globalAlpha = showTraffic ? 0.7 : 0.4;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.globalAlpha = 1;

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);

      // Weather overlay
      if (showWeather && seg.weather !== 'clear') {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.font = `${12 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.textAlign = 'center';
        const weatherIcon = seg.weather === 'rain' || seg.weather === 'heavy_rain' ? '🌧️' : seg.weather === 'snow' ? '❄️' : seg.weather === 'fog' ? '🌫️' : '⛈️';
        ctx.fillText(weatherIcon, mx, my - 10 * scaleY);
      }

      // Congestion label
      if (showTraffic && seg.congestionLevel > 50) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(mx - 16 * scaleX, my - 8 * scaleY, 32 * scaleX, 14 * scaleY);
        ctx.fillStyle = getCongestionColor(seg.congestionLevel);
        ctx.font = `bold ${9 * Math.min(scaleX, scaleY)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${seg.congestionLevel}%`, mx, my + 2 * scaleY);
      }
    });

    // Fuel stations
    fuelStations.forEach(station => {
      const sx = station.position.x * scaleX;
      const sy = station.position.y * scaleY;
      const size = 14 * Math.min(scaleX, scaleY);

      // Glow
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('⛽', sx, sy);
      ctx.shadowBlur = 0;

      // Price label
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(sx - 18 * scaleX, sy + 2, 36 * scaleX, 12 * scaleY);
      ctx.fillStyle = '#00ff88';
      ctx.font = `${8 * Math.min(scaleX, scaleY)}px monospace`;
      ctx.fillText(`$${station.fuelPrice}`, sx, sy + 11 * scaleY);
    });

    // Hazards
    if (showHazards) {
      hazards.filter(h => h.isActive).forEach(h => {
        const hx = h.position.x * scaleX;
        const hy = h.position.y * scaleY;
        const t = Date.now() * 0.003;
        const pulse = 8 + Math.sin(t) * 4;

        // Pulsing ring
        ctx.strokeStyle = h.severity === 'critical' ? 'rgba(255,51,85,0.6)' : h.severity === 'high' ? 'rgba(255,170,0,0.5)' : 'rgba(255,255,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx, hy, pulse * Math.min(scaleX, scaleY), 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `${12 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.textAlign = 'center';
        const icon = h.type === 'weather' ? '⛈️' : h.type === 'accident' ? '💥' : h.type === 'construction' ? '🚧' : '⚠️';
        ctx.fillText(icon, hx, hy + 4);
      });
    }

    // Vehicles
    vehicles.forEach(v => {
      const vx = v.position.x * scaleX;
      const vy = v.position.y * scaleY;
      const isSelected = selectedVehicleId === v.id;
      const size = 16 * Math.min(scaleX, scaleY);

      // Selection glow
      if (isSelected) {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vx, vy, size * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Status ring
      if (v.status === 'emergency') {
        const t = Date.now() * 0.005;
        ctx.strokeStyle = `rgba(255,51,85,${0.5 + Math.sin(t) * 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(vx, vy, size + 6 + Math.sin(t) * 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (v.status === 'negotiating') {
        ctx.strokeStyle = 'rgba(255,170,0,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vx, vy, size + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Vehicle emoji
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(getVehicleEmoji(v.type), vx, vy + size * 0.35);

      // Fuel indicator dot
      const fuelColor = v.fuelLevel < 20 ? '#ff3355' : v.fuelLevel < 50 ? '#ffaa00' : '#00ff88';
      ctx.fillStyle = fuelColor;
      ctx.beginPath();
      ctx.arc(vx + size * 0.6, vy - size * 0.4, 3 * Math.min(scaleX, scaleY), 0, Math.PI * 2);
      ctx.fill();

      // Name label
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      const labelW = 60 * scaleX;
      ctx.fillRect(vx - labelW / 2, vy + size * 0.5, labelW, 13 * scaleY);
      ctx.fillStyle = isSelected ? '#00f0ff' : '#ccc';
      ctx.font = `${8 * Math.min(scaleX, scaleY)}px monospace`;
      ctx.fillText(v.name, vx, vy + size * 0.5 + 10 * scaleY);

      // Route line to destination (selected only)
      if (isSelected) {
        ctx.strokeStyle = 'rgba(0,240,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(v.destination.x * scaleX, v.destination.y * scaleY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Destination marker
        ctx.fillStyle = 'rgba(0,240,255,0.5)';
        ctx.beginPath();
        ctx.arc(v.destination.x * scaleX, v.destination.y * scaleY, 5 * Math.min(scaleX, scaleY), 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `${10 * Math.min(scaleX, scaleY)}px Arial`;
        ctx.fillText('📍', v.destination.x * scaleX, v.destination.y * scaleY);
      }
    });

    // Legend
    ctx.fillStyle = 'rgba(10,10,26,0.8)';
    ctx.fillRect(W - 130, H - 80, 125, 75);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(W - 130, H - 80, 125, 75);
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    const legendItems = [
      { color: '#00ff88', text: 'Low congestion' },
      { color: '#ffaa00', text: 'Moderate' },
      { color: '#ff6644', text: 'Heavy' },
      { color: '#ff3355', text: 'Gridlock' },
    ];
    legendItems.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(W - 122, H - 72 + i * 16, 8, 8);
      ctx.fillStyle = '#999';
      ctx.fillText(item.text, W - 110, H - 64 + i * 16);
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, [vehicles, roadSegments, fuelStations, hazards, selectedVehicleId, showTraffic, showWeather, showHazards, showHeatMap]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = rect.width / 800;
    const scaleY = rect.height / 550;

    let clickedVehicle: string | null = null;
    let minDist = 25;

    vehicles.forEach(v => {
      const vx = v.position.x * scaleX;
      const vy = v.position.y * scaleY;
      const dist = Math.sqrt((mx - vx) ** 2 + (my - vy) ** 2);
      if (dist < minDist) {
        minDist = dist;
        clickedVehicle = v.id;
      }
    });

    selectVehicle(clickedVehicle);
  }, [vehicles, selectVehicle]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg cursor-crosshair"
        onClick={handleClick}
        style={{ imageRendering: 'auto' }}
      />
      <div className="absolute top-2 left-2 flex gap-1 text-[10px]">
        <span className="glass-card px-2 py-0.5 text-gray-400">{vehicles.length} vehicles</span>
        <span className="glass-card px-2 py-0.5 text-gray-400">{roadSegments.length} segments</span>
        <span className="glass-card px-2 py-0.5 text-gray-400">{hazards.filter(h => h.isActive).length} hazards</span>
      </div>
    </div>
  );
};

export default InteractiveMap;

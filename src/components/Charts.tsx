import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useStore } from '../store/useStore';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 },
  plugins: {
    legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 12, padding: 6 } },
    tooltip: { backgroundColor: 'rgba(10,10,26,0.9)', titleColor: '#00f0ff', bodyColor: '#ccc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555', font: { size: 8 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555', font: { size: 8 } } },
  },
};

export const TrafficChart: React.FC = () => {
  const { congestionHistory } = useStore();

  const data = useMemo(() => {
    const labels = congestionHistory.slice(-20).map((_, i) => `${i}`);
    const seg1 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_2')?.level ?? 0);
    const seg2 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_4')?.level ?? 0);
    const seg3 = congestionHistory.slice(-20).map(h => h.segments.find(s => s.id === 'seg_10')?.level ?? 0);

    return {
      labels,
      datasets: [
        { label: 'Main Street', data: seg1, borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.1)', fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
        { label: 'Central Park', data: seg2, borderColor: '#ffaa00', backgroundColor: 'rgba(255,170,0,0.05)', fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
        { label: 'Shopping', data: seg3, borderColor: '#ff3355', backgroundColor: 'rgba(255,51,85,0.05)', fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
      ],
    };
  }, [congestionHistory]);

  return (
    <div className="glass-card p-3 h-full">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron' }}>
        📈 Traffic Congestion
      </h3>
      <div className="h-[180px]">
        <Line data={data} options={chartOptions as any} />
      </div>
    </div>
  );
};

export const FuelChart: React.FC = () => {
  const { vehicles } = useStore();

  const data = useMemo(() => ({
    labels: vehicles.map(v => v.name.split(' ')[0]),
    datasets: [{
      label: 'Fuel Level %',
      data: vehicles.map(v => v.fuelLevel),
      backgroundColor: vehicles.map(v =>
        v.fuelLevel < 20 ? 'rgba(255,51,85,0.6)' : v.fuelLevel < 50 ? 'rgba(255,170,0,0.6)' : 'rgba(0,255,136,0.6)'
      ),
      borderColor: vehicles.map(v =>
        v.fuelLevel < 20 ? '#ff3355' : v.fuelLevel < 50 ? '#ffaa00' : '#00ff88'
      ),
      borderWidth: 1,
      borderRadius: 3,
    }],
  }), [vehicles]);

  const opts = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, max: 100, min: 0 },
    },
  };

  return (
    <div className="glass-card p-3 h-full">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron' }}>
        ⛽ Vehicle Fuel Levels
      </h3>
      <div className="h-[180px]">
        <Bar data={data} options={opts as any} />
      </div>
    </div>
  );
};

export const LearningChart: React.FC = () => {
  const { learningHistory } = useStore();

  const data = useMemo(() => ({
    labels: learningHistory.map(l => `${l.iteration}`),
    datasets: [{
      label: 'AI Accuracy %',
      data: learningHistory.map(l => l.accuracy),
      borderColor: '#7b61ff',
      backgroundColor: 'rgba(123,97,255,0.1)',
      fill: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 1,
      pointBackgroundColor: '#7b61ff',
    }],
  }), [learningHistory]);

  const opts = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, min: 60, max: 100 },
    },
  };

  return (
    <div className="glass-card p-3 h-full">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron' }}>
        🧠 AI Learning Progress
      </h3>
      <div className="h-[180px]">
        <Line data={data} options={opts as any} />
      </div>
    </div>
  );
};

export default { TrafficChart, FuelChart, LearningChart };

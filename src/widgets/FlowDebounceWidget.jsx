import { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Zap } from 'lucide-react';

function FlowDebounceWidget() {
  const [emissions, setEmissions] = useState([]);
  const [debounceTime, setDebounceTime] = useState(500);
  const [isPaused, setIsPaused] = useState(false);
  const lastValueRef = useRef(null);

  const emit = () => {
    const now = performance.now();
    const newEmission = {
      id: crypto.randomUUID(),
      value: Math.floor(Math.random() * 100),
      timestamp: now,
      position: 0,
      hue: Math.floor(Math.random() * 360),
      dropped: false,
    };

    setEmissions((current) => {
      const next = current.map((item) => {
        const isCandidate = lastValueRef.current === item.id;
        if (isCandidate && now - item.timestamp < debounceTime) {
          return { ...item, dropped: true };
        }
        return item;
      });

      lastValueRef.current = newEmission.id;
      return [...next, newEmission];
    });
  };

  useEffect(() => {
    if (isPaused) return undefined;

    const interval = window.setInterval(() => {
      setEmissions((current) =>
        current
          .map((item) => ({ ...item, position: item.position + 1.8 }))
          .filter((item) => item.position < 104)
      );
    }, 32);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="widget">
      <div className="widget-header">
        <div className="eyebrow">
          <Zap size={18} />
          Flow.debounce() Sandbox
        </div>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
            onClick={() => setIsPaused((value) => !value)}
          >
            <RefreshCw size={16} className={isPaused ? '' : 'spin-slow'} />
          </button>
          <button className="primary-button" type="button" onClick={emit}>
            <Play size={15} fill="currentColor" />
            Emit value
          </button>
        </div>
      </div>

      <div className="flow-pipe" aria-label="Flow emissions moving through debounce operator">
        <div className="operator-line">
          <span>debounce gate</span>
        </div>
        {emissions.map((item) => (
          <div
            className={`emission ${item.dropped ? 'dropped' : ''}`}
            key={item.id}
            style={{
              left: `${item.position}%`,
              backgroundColor: `hsl(${item.hue} 78% 58%)`,
            }}
          >
            {item.value}
            {item.dropped && <small>Dropped</small>}
          </div>
        ))}
      </div>

      <div className="control-grid">
        <label className="control-panel">
          <span>Debounce delay: {debounceTime}ms</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={debounceTime}
            onChange={(event) => setDebounceTime(Number(event.target.value))}
          />
        </label>
        <div className="note-panel">
          Rapid values cancel the previous pending value. The final quiet value is the one that survives.
        </div>
      </div>
    </section>
  );
}

export default FlowDebounceWidget;

import { useState } from 'react';
import { Activity } from 'lucide-react';

const stages = [
  { name: 'onAttach', copy: 'The Fragment receives its Activity context.' },
  { name: 'onCreate', copy: 'Instance state is initialized before the View exists.' },
  { name: 'onCreateView', copy: 'The View tree is inflated and can now be rendered.' },
  { name: 'onStart', copy: 'The Fragment is visible but not yet foreground focused.' },
  { name: 'onResume', copy: 'The Fragment is interactive and actively running.' },
];

function LifecycleHeartbeatWidget() {
  const [stage, setStage] = useState(0);

  return (
    <section className="widget lifecycle-widget">
      <div className="lifecycle-list">
        <div className="eyebrow amber">
          <Activity size={18} />
          Lifecycle Heartbeat
        </div>
        <div className="stage-stack">
          {stages.map((item, index) => (
            <button
              type="button"
              className={`stage-row ${index === stage ? 'active' : ''} ${index < stage ? 'complete' : ''}`}
              key={item.name}
              onClick={() => setStage(index)}
            >
              <span />
              {item.name}()
            </button>
          ))}
        </div>
      </div>

      <div className="device-panel">
        <div className={`device ${stage >= 2 ? 'inflated' : ''}`}>
          <div className="speaker" />
          <div className="device-screen">
            {stage >= 2 && (
              <>
                <div className="toolbar" />
                <div className="text-line wide" />
                <div className="text-line" />
                <div className="action-chip" />
              </>
            )}
          </div>
        </div>
        <p>{stages[stage].copy}</p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setStage((current) => (current + 1) % stages.length)}
        >
          {stage === stages.length - 1 ? 'Restart lifecycle' : 'Next phase'}
        </button>
      </div>
    </section>
  );
}

export default LifecycleHeartbeatWidget;

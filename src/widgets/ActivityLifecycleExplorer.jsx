import { useEffect, useMemo, useState } from 'react';
import { Home, RotateCcw, Smartphone } from 'lucide-react';

const paths = {
  launch: ['onCreate', 'onStart', 'onResume'],
  background: ['onPause', 'onStop'],
  return: ['onRestart', 'onStart', 'onResume'],
  rotate: ['onPause', 'onStop', 'onDestroy', 'onCreate', 'onStart', 'onResume'],
};

const callbacks = ['onCreate', 'onStart', 'onResume', 'onPause', 'onStop', 'onRestart', 'onDestroy'];

const pathExplanation = {
  launch: {
    title: 'Launch',
    copy: 'Android creates the Activity, makes it visible, then gives it focus.',
    rule: 'Initialize UI in onCreate, start visible work in onStart, start foreground-only work in onResume.',
  },
  background: {
    title: 'Home pressed',
    copy: 'The Activity first loses focus, then becomes invisible. The instance can still remain in memory.',
    rule: 'Keep onPause fast. Release visible-only resources in onStop.',
  },
  return: {
    title: 'Return from background',
    copy: 'A stopped Activity does not run onCreate again. It restarts, becomes visible, then resumes.',
    rule: 'Use onRestart only for work that should happen after returning from Stopped.',
  },
  rotate: {
    title: 'Configuration change',
    copy: 'By default, Android tears down the old Activity and creates a new one for the new configuration.',
    rule: 'Keep durable screen state in a ViewModel or saved state, not only in Activity fields.',
  },
};

function ActivityLifecycleExplorer() {
  const [events, setEvents] = useState(paths.launch);
  const [screenState, setScreenState] = useState('foreground');
  const [scenario, setScenario] = useState('launch');
  const [step, setStep] = useState(paths.launch.length - 1);

  const runPath = (name) => {
    setEvents(paths[name]);
    setScenario(name);
    setStep(paths[name].length - 1);
    if (name === 'background') setScreenState('background');
    if (name === 'return' || name === 'launch') setScreenState('foreground');
    if (name === 'rotate') setScreenState('rotating');
  };

  useEffect(() => {
    const handleCue = (event) => {
      if (event.detail?.postId === 'activity-lifecycle' && paths[event.detail.cue]) {
        runPath(event.detail.cue);
      }
    };

    window.addEventListener('droidlab:cue', handleCue);
    return () => window.removeEventListener('droidlab:cue', handleCue);
  }, []);

  const activeEvents = events.slice(0, step + 1);
  const active = activeEvents.at(-1);
  const visible = useMemo(() => !['onStop', 'onDestroy'].includes(active), [active]);
  const currentScenario = pathExplanation[scenario];

  return (
    <section className="widget activity-widget">
      <div className="widget-header">
        <div className="eyebrow amber">
          <Smartphone size={18} />
          Activity Lifecycle Explorer
        </div>
        <div className="button-row">
          <button type="button" className="secondary-button compact" onClick={() => runPath('launch')}>
            Launch
          </button>
          <button type="button" className="secondary-button compact" onClick={() => runPath('background')}>
            <Home size={14} />
            Home
          </button>
          <button type="button" className="secondary-button compact" onClick={() => runPath('return')}>
            Return
          </button>
          <button type="button" className="secondary-button compact" onClick={() => runPath('rotate')}>
            <RotateCcw size={14} />
            Rotate
          </button>
        </div>
      </div>

      <div className="intuition-panel">
        <strong>Intuition</strong>
        <p>
          The lifecycle is not a checklist. It is Android changing the screen contract: created, visible,
          interactive, not focused, not visible, or destroyed.
        </p>
      </div>

      <div className="activity-grid">
        <div className={`activity-phone ${screenState}`}>
          <div className="phone-top" />
          <div className="activity-screen">
            <strong>{visible ? 'MainActivity' : 'Home screen'}</strong>
            <span>
              {active === 'onResume'
                ? 'interactive'
                : active === 'onStart'
                  ? 'visible'
                  : visible
                    ? 'being prepared'
                    : 'activity stopped'}
            </span>
            <div className="screen-resource-row">
              <i className={active === 'onResume' ? 'on' : ''} />
              <small>input focus</small>
            </div>
            <div className="screen-resource-row">
              <i className={visible ? 'on' : ''} />
              <small>visible resources</small>
            </div>
          </div>
        </div>

        <div className="callback-rail">
          <div className="rail-title">
            <strong>{currentScenario.title}</strong>
            <span>{currentScenario.copy}</span>
          </div>
          {callbacks.map((callback) => (
            <div
              className={`callback-step ${activeEvents.includes(callback) ? 'visited' : ''} ${active === callback ? 'active' : ''}`}
              key={callback}
            >
              {callback}()
            </div>
          ))}
          <div className="step-controls">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Prev callback
            </button>
            <button type="button" onClick={() => setStep((current) => Math.min(events.length - 1, current + 1))}>
              Next callback
            </button>
          </div>
        </div>

        <div className="activity-note">
          <strong>Current mental model</strong>
          <p>
            {active === 'onResume'
              ? 'The Activity is in front and interactive. Start foreground-only work here.'
              : active === 'onStop'
                ? 'The Activity is not visible. Release UI-heavy resources here.'
                : active === 'onPause'
                  ? 'The Activity is losing focus. Keep this callback fast.'
                  : active === 'onDestroy'
                    ? 'The instance is ending. Do final cleanup only.'
                    : 'The Activity is moving through its setup path.'}
          </p>
          <div className="explain-row">
            <strong>Production rule</strong>
            <span>{currentScenario.rule}</span>
          </div>
          <div className="explain-row">
            <strong>Why this matters</strong>
            <span>
              Work in the wrong callback either keeps running while the user cannot see it, or gets torn down too
              early while the Activity is still visible.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActivityLifecycleExplorer;

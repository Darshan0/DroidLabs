import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Plus, Radio, RotateCcw, X, Zap } from 'lucide-react';

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const makeEmission = (sequence) => ({
  id: `value-${sequence}`,
  label: letters[sequence % letters.length],
  sequence,
});

const initialCollectors = [
  { id: 'collector-1', label: 'Collector 1', late: false, received: [] },
  { id: 'collector-2', label: 'Collector 2', late: false, received: [] },
];

function FlowIllustration({ type, active, history, collectors, replay, buffer, onRemoveCollector }) {
  const isState = type === 'state';
  const latest = history.at(-1);
  const replayCache = isState ? (latest ? [latest] : []) : history.slice(-replay);
  const bufferCache = isState ? [] : history.slice(-buffer);

  return (
    <div className={`flow-illustration ${type} ${active ? 'active' : ''}`}>
      <div className="illustration-title">
        <strong>{isState ? 'StateFlow' : 'SharedFlow'}</strong>
        <span>{isState ? 'state holder: keeps one current value' : `broadcast: replay ${replay}, buffer ${buffer}`}</span>
      </div>

      <div className="docs-flow-scene compact">
        <div className="stream-card consumer-card">
          <strong>Consumers</strong>
          <span>collect</span>
          <div className="consumer-list">
            {collectors.map((collector) => (
              <div className={`consumer-mini ${collector.late ? 'late' : ''}`} key={`${type}-${collector.id}`}>
                <div className="consumer-title-row">
                  <b>{collector.label}</b>
                  <button type="button" aria-label={`Remove ${collector.label}`} onClick={() => onRemoveCollector(collector.id)}>
                    <X size={11} />
                  </button>
                </div>
                <small>{collector.late ? 'joined late' : 'live'}</small>
                <div>
                  {collector.received.length === 0 ? (
                    <i>empty</i>
                  ) : (
                    collector.received.map((item, index) => <em key={`${item}-${index}`}>{item}</em>)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`stream-card hub-card ${type}`}>
          <strong>{isState ? 'Current value' : 'Replay cache'}</strong>
          <span>{isState ? 'old value replaced' : 'late collector memory'}</span>
          <div className="hub-cache">
            {replayCache.length === 0 ? <i>empty</i> : replayCache.map((item) => <em key={item.id}>{item.label}</em>)}
          </div>
          {!isState && (
            <div className="buffer-cache">
              <b>buffer</b>
              <span>{bufferCache.length ? bufferCache.map((item) => item.label).join(', ') : 'empty'}</span>
            </div>
          )}
        </div>

        <div className="stream-card producer-card">
          <strong>Producer</strong>
          <span>emits {latest?.label}</span>
          <div className="producer-pulse" />
        </div>

        {active && latest && (
          <>
            <span className={`stream-token producer-token ${type}`} key={`${type}-producer-${latest.id}`}>
              {latest.label}
            </span>
            <span className={`stream-token consumer-token ${type}`} key={`${type}-consumer-${latest.id}`}>
              {latest.label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function FlowChoiceWidget() {
  const [activeType, setActiveType] = useState('state');
  const [replay, setReplay] = useState(2);
  const [buffer, setBuffer] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [sequence, setSequence] = useState(0);
  const [history, setHistory] = useState([makeEmission(0)]);
  const [stateCollectors, setStateCollectors] = useState(
    initialCollectors.map((collector) => ({ ...collector, received: ['A'] }))
  );
  const [sharedCollectors, setSharedCollectors] = useState(
    initialCollectors.map((collector) => ({ ...collector, received: ['A'] }))
  );

  const latest = history.at(-1);
  const sharedReplayCache = useMemo(() => history.slice(-replay), [history, replay]);

  const emit = () => {
    setSequence((currentSequence) => {
      const nextSequence = currentSequence + 1;
      const emission = makeEmission(nextSequence);

      setHistory((current) => [...current.slice(-7), emission]);
      setStateCollectors((current) =>
        current.map((collector) => ({
          ...collector,
          received: [emission.label],
        }))
      );
      setSharedCollectors((current) =>
        current.map((collector) => ({
          ...collector,
          received: [...collector.received.slice(-2), emission.label],
        }))
      );

      return nextSequence;
    });
  };

  const reset = (type = activeType) => {
    const first = makeEmission(0);
    setActiveType(type);
    setSequence(0);
    setHistory([first]);
    setStateCollectors(initialCollectors.map((collector) => ({ ...collector, received: [first.label] })));
    setSharedCollectors(initialCollectors.map((collector) => ({ ...collector, received: [first.label] })));
  };

  const addLateCollector = () => {
    if (activeType === 'state') {
      setStateCollectors((current) => [
        ...current.slice(0, 3),
        {
          id: `state-late-${current.length + 1}`,
          label: `Late collector ${current.length + 1}`,
          late: true,
          received: latest ? [latest.label] : [],
        },
      ]);
      return;
    }

    setSharedCollectors((current) => [
      ...current.slice(0, 3),
      {
        id: `shared-late-${current.length + 1}`,
        label: `Late collector ${current.length + 1}`,
        late: true,
        received: sharedReplayCache.map((item) => item.label),
      },
    ]);
  };

  const removeCollector = (type, collectorId) => {
    const setter = type === 'state' ? setStateCollectors : setSharedCollectors;

    setter((current) => {
      if (current.length <= 1) return current;
      return current.filter((collector) => collector.id !== collectorId);
    });
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = window.setInterval(emit, 2200);
    return () => window.clearInterval(interval);
  }, [isRunning, activeType, replay, buffer]);

  useEffect(() => {
    const handleCue = (event) => {
      if (event.detail?.postId !== 'stateflow-vs-sharedflow') return;

      if (event.detail.cue === 'state') {
        reset('state');
        setIsRunning(true);
      }
      if (event.detail.cue === 'state-late') {
        reset('state');
        window.setTimeout(addLateCollector, 100);
      }
      if (event.detail.cue === 'shared-event') {
        reset('shared');
        setReplay(0);
        setBuffer(1);
        setIsRunning(true);
      }
      if (event.detail.cue === 'shared-replay') {
        reset('shared');
        setReplay(2);
        setBuffer(1);
        window.setTimeout(addLateCollector, 100);
      }
    };

    window.addEventListener('droidlab:cue', handleCue);
    return () => window.removeEventListener('droidlab:cue', handleCue);
  }, [activeType, latest, sharedReplayCache]);

  const explanation =
    activeType === 'state'
      ? 'StateFlow: a late collector gets only the current letter. Earlier letters are replaced.'
      : replay === 0
        ? 'SharedFlow: late collectors get no old letters when replay is 0. They only see future emissions.'
        : `SharedFlow: a late collector receives the last ${replay} letter(s), then future emissions.`;

  return (
    <section className="widget concept-widget stream-widget">
      <div className="widget-header">
        <div className="eyebrow">
          <Radio size={18} />
          Flow Illustrations
        </div>
        <div className="button-row">
          <button type="button" className="icon-button" aria-label={isRunning ? 'Pause stream' : 'Run stream'} onClick={() => setIsRunning((value) => !value)}>
            {isRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          </button>
          <button type="button" className="primary-button" onClick={emit}>
            <Zap size={14} />
            Emit {letters[(sequence + 1) % letters.length]}
          </button>
        </div>
      </div>

      <div className="stream-mode-switch" aria-label="Choose illustration">
        <button type="button" className={activeType === 'state' ? 'active' : ''} onClick={() => setActiveType('state')}>
          StateFlow illustration
          <span>A/B/C replaces the current value</span>
        </button>
        <button type="button" className={activeType === 'shared' ? 'active' : ''} onClick={() => setActiveType('shared')}>
          SharedFlow illustration
          <span>A/B/C broadcasts with replay</span>
        </button>
      </div>

      <FlowIllustration
        type="state"
        active={activeType === 'state'}
        history={history}
        collectors={stateCollectors}
        replay={1}
        buffer={0}
        onRemoveCollector={(collectorId) => removeCollector('state', collectorId)}
      />
      <FlowIllustration
        type="shared"
        active={activeType === 'shared'}
        history={history}
        collectors={sharedCollectors}
        replay={replay}
        buffer={buffer}
        onRemoveCollector={(collectorId) => removeCollector('shared', collectorId)}
      />

      <div className="stream-controls">
        <label>
          <span>SharedFlow replay: {replay}</span>
          <input type="range" min="0" max="4" value={replay} onChange={(event) => setReplay(Number(event.target.value))} />
        </label>
        <label>
          <span>SharedFlow buffer: {buffer}</span>
          <input type="range" min="0" max="4" value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} />
        </label>
        <button type="button" className="secondary-button compact" onClick={addLateCollector}>
          <Plus size={14} />
          Add late collector
        </button>
        <button type="button" className="secondary-button compact" onClick={() => reset(activeType)}>
          <RotateCcw size={14} />
          Reset collectors
        </button>
      </div>

      <div className="stream-explanation">
        <strong>What to watch</strong>
        <p>{explanation}</p>
      </div>
    </section>
  );
}

export default FlowChoiceWidget;

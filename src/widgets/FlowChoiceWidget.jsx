import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Plus, Radio, Zap } from 'lucide-react';

const stateValues = ['Loading', 'Content', 'Error', 'Content+Cache'];
const sharedEvents = ['Toast', 'Navigate', 'Refresh', 'Analytics'];

const makeEmission = (mode, sequence) => {
  const source = mode === 'state' ? stateValues : sharedEvents;
  return {
    id: `${mode}-${sequence}`,
    label: source[sequence % source.length],
    sequence,
  };
};

const initialConsumers = [
  { id: 'collector-1', label: 'Collector 1', late: false, received: [] },
  { id: 'collector-2', label: 'Collector 2', late: false, received: [] },
];

function FlowChoiceWidget() {
  const [mode, setMode] = useState('state');
  const [replay, setReplay] = useState(1);
  const [buffer, setBuffer] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [sequence, setSequence] = useState(0);
  const [history, setHistory] = useState([makeEmission('state', 0)]);
  const [consumers, setConsumers] = useState(initialConsumers);

  const latest = history.at(-1);
  const visibleReplay = mode === 'state' ? 1 : replay;
  const replayCache = useMemo(() => history.slice(-visibleReplay), [history, visibleReplay]);
  const bufferCache = useMemo(() => (mode === 'state' ? [] : history.slice(-buffer)), [buffer, history, mode]);

  const emit = () => {
    setSequence((currentSequence) => {
      const nextSequence = currentSequence + 1;
      const emission = makeEmission(mode, nextSequence);

      setHistory((current) => [...current.slice(-7), emission]);
      setConsumers((current) =>
        current.map((consumer) => ({
          ...consumer,
          received: [...consumer.received.slice(-2), emission.label],
        }))
      );

      return nextSequence;
    });
  };

  const switchMode = (nextMode) => {
    const firstEmission = makeEmission(nextMode, 0);
    setMode(nextMode);
    setReplay(nextMode === 'state' ? 1 : replay);
    setSequence(0);
    setHistory([firstEmission]);
    setConsumers(initialConsumers.map((consumer) => ({ ...consumer, received: [firstEmission.label] })));
  };

  const addLateConsumer = () => {
    const replayed = mode === 'state' ? (latest ? [latest.label] : []) : replayCache.map((item) => item.label);
    setConsumers((current) => [
      ...current.slice(0, 3),
      {
        id: `collector-${current.length + 1}`,
        label: `Late collector ${current.length + 1}`,
        late: true,
        received: replayed,
      },
    ]);
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = window.setInterval(emit, 2200);
    return () => window.clearInterval(interval);
  }, [isRunning, mode, replay, buffer]);

  useEffect(() => {
    const handleCue = (event) => {
      if (event.detail?.postId !== 'stateflow-vs-sharedflow') return;

      if (event.detail.cue === 'state') {
        switchMode('state');
        setIsRunning(true);
      }
      if (event.detail.cue === 'state-late') {
        switchMode('state');
        window.setTimeout(addLateConsumer, 100);
      }
      if (event.detail.cue === 'shared-event') {
        switchMode('shared');
        setReplay(0);
        setBuffer(1);
        setIsRunning(true);
      }
      if (event.detail.cue === 'shared-replay') {
        switchMode('shared');
        setReplay(2);
        setBuffer(1);
        window.setTimeout(addLateConsumer, 100);
      }
    };

    window.addEventListener('droidlab:cue', handleCue);
    return () => window.removeEventListener('droidlab:cue', handleCue);
  }, [latest, replayCache]);

  const explanation =
    mode === 'state'
      ? 'StateFlow behaves like a state holder. The intermediary keeps exactly one current value, and every new collector immediately sees it.'
      : replay === 0
        ? 'SharedFlow with replay = 0 behaves like a live broadcast. Late collectors do not receive old emissions.'
        : 'SharedFlow with replay stores a small cache. Late collectors receive that cache first, then future emissions.';

  return (
    <section className="widget concept-widget stream-widget">
      <div className="widget-header">
        <div className="eyebrow">
          <Radio size={18} />
          Flow Stream Lab
        </div>
        <div className="button-row">
          <button type="button" className="icon-button" aria-label={isRunning ? 'Pause stream' : 'Run stream'} onClick={() => setIsRunning((value) => !value)}>
            {isRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          </button>
          <button type="button" className="primary-button" onClick={emit}>
            <Zap size={14} />
            Emit now
          </button>
        </div>
      </div>

      <div className="stream-mode-switch" aria-label="Choose flow type">
        <button type="button" className={mode === 'state' ? 'active' : ''} onClick={() => switchMode('state')}>
          StateFlow
          <span>one current value</span>
        </button>
        <button type="button" className={mode === 'shared' ? 'active' : ''} onClick={() => switchMode('shared')}>
          SharedFlow
          <span>broadcast + replay</span>
        </button>
      </div>

      <div className="docs-flow-scene">
        <div className="stream-card consumer-card">
          <strong>Consumers</strong>
          <span>collect values</span>
          <div className="consumer-list">
            {consumers.map((consumer) => (
              <div className={`consumer-mini ${consumer.late ? 'late' : ''}`} key={consumer.id}>
                <b>{consumer.label}</b>
                <small>{consumer.late ? 'joined late' : 'live'}</small>
                <div>
                  {consumer.received.length === 0 ? <i>empty</i> : consumer.received.map((item, index) => <em key={`${item}-${index}`}>{item}</em>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`stream-card hub-card ${mode}`}>
          <strong>{mode === 'state' ? 'State holder' : 'SharedFlow cache'}</strong>
          <span>{mode === 'state' ? 'keeps latest' : 'optional replay'}</span>
          <div className="hub-cache">
            {replayCache.length === 0 ? <i>no replay</i> : replayCache.map((item) => <em key={item.id}>{item.label}</em>)}
          </div>
          {mode === 'shared' && (
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

        {latest && (
          <>
            <span className={`stream-token producer-token ${mode}`} key={`producer-${latest.id}`}>
              {latest.label}
            </span>
            <span className={`stream-token consumer-token ${mode}`} key={`consumer-${latest.id}`}>
              {latest.label}
            </span>
          </>
        )}
      </div>

      <div className="stream-controls">
        <label>
          <span>Replay handed to late collectors: {visibleReplay}</span>
          <input
            type="range"
            min="0"
            max="4"
            value={visibleReplay}
            disabled={mode === 'state'}
            onChange={(event) => setReplay(Number(event.target.value))}
          />
        </label>
        <label>
          <span>Extra buffer capacity: {mode === 'state' ? 0 : buffer}</span>
          <input
            type="range"
            min="0"
            max="4"
            value={mode === 'state' ? 0 : buffer}
            disabled={mode === 'state'}
            onChange={(event) => setBuffer(Number(event.target.value))}
          />
        </label>
        <button type="button" className="secondary-button compact" onClick={addLateConsumer}>
          <Plus size={14} />
          Add late collector
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

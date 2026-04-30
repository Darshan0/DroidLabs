import { useEffect, useMemo, useState } from 'react';
import { Plus, Radio, SlidersHorizontal } from 'lucide-react';

function FlowChoiceWidget() {
  const [flowType, setFlowType] = useState('StateFlow');
  const [replay, setReplay] = useState(1);
  const [buffer, setBuffer] = useState(0);
  const [collectors, setCollectors] = useState(2);
  const [events, setEvents] = useState(['A']);
  const [lateCollector, setLateCollector] = useState(false);

  const emit = () => {
    const next = String.fromCharCode(65 + (events.length % 26));
    setEvents((current) => [...current.slice(-7), next]);
  };

  useEffect(() => {
    const handleCue = (event) => {
      if (event.detail?.postId !== 'stateflow-vs-sharedflow') return;

      if (event.detail.cue === 'state') {
        setFlowType('StateFlow');
        setCollectors(2);
        setLateCollector(false);
        setEvents(['Loading', 'Content']);
      }
      if (event.detail.cue === 'state-late') {
        setFlowType('StateFlow');
        setCollectors(3);
        setLateCollector(true);
        setEvents(['Loading', 'Content']);
      }
      if (event.detail.cue === 'shared-event') {
        setFlowType('SharedFlow');
        setReplay(0);
        setBuffer(1);
        setCollectors(2);
        setLateCollector(false);
        setEvents(['Navigate', 'Toast']);
      }
      if (event.detail.cue === 'shared-replay') {
        setFlowType('SharedFlow');
        setReplay(2);
        setBuffer(1);
        setCollectors(3);
        setLateCollector(true);
        setEvents(['A', 'B', 'C']);
      }
    };

    window.addEventListener('droidlab:cue', handleCue);
    return () => window.removeEventListener('droidlab:cue', handleCue);
  }, []);

  const visibleReplay = flowType === 'StateFlow' ? 1 : replay;
  const latest = events.at(-1);
  const replayCache = useMemo(() => events.slice(-visibleReplay), [events, visibleReplay]);
  const buffered = flowType === 'StateFlow' ? [] : events.slice(-buffer);
  const liveTokens = useMemo(() => events.slice(-4), [events]);
  const newCollectorReceives =
    flowType === 'StateFlow'
      ? `A new collector immediately receives ${latest}, because StateFlow always exposes one current value.`
      : visibleReplay === 0
        ? 'A new collector receives nothing old. It only receives future emissions.'
        : `A new collector first receives ${replayCache.join(', ')}, then future emissions.`;

  const recommendation =
    flowType === 'StateFlow'
      ? 'Use for durable UI state: screen model, selected tab, loading state, form state.'
      : replay === 0
        ? 'Use for one-off events or broadcasts where new collectors do not need old values.'
        : 'Use when late collectors need recent events, but be deliberate about replay size.';

  return (
    <section className="widget concept-widget">
      <div className="widget-header">
        <div className="eyebrow">
          <Radio size={18} />
          StateFlow vs SharedFlow Lab
        </div>
        <button type="button" className="primary-button" onClick={emit}>
          Emit {String.fromCharCode(65 + (events.length % 26))}
        </button>
        <button type="button" className="secondary-button compact" onClick={() => setLateCollector(true)}>
          <Plus size={14} />
          Late collector
        </button>
      </div>

      <div className="intuition-panel">
        <strong>Intuition</strong>
        <p>
          Think of <code>StateFlow</code> as a whiteboard with exactly one current answer. Think of{' '}
          <code>SharedFlow</code> as a speaker system: active listeners hear broadcasts, and <code>replay</code>{' '}
          decides how much a late listener hears.
        </p>
      </div>

      <div className="flow-lab-grid">
        <div className="config-panel">
          <div className="pool-choice-row">
            {['StateFlow', 'SharedFlow'].map((type) => (
              <button type="button" className={flowType === type ? 'active' : ''} key={type} onClick={() => setFlowType(type)}>
                {type}
              </button>
            ))}
          </div>
          <label>
            <span>Replay: {visibleReplay}</span>
            <input
              type="range"
              min="0"
              max="4"
              value={visibleReplay}
              disabled={flowType === 'StateFlow'}
              onChange={(event) => setReplay(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Extra buffer: {flowType === 'StateFlow' ? 0 : buffer}</span>
            <input
              type="range"
              min="0"
              max="4"
              value={flowType === 'StateFlow' ? 0 : buffer}
              disabled={flowType === 'StateFlow'}
              onChange={(event) => setBuffer(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Collectors: {collectors}</span>
            <input
              type="range"
              min="1"
              max="4"
              value={collectors}
              onChange={(event) => setCollectors(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="flow-stage">
          <div className="flow-animation">
            <div className="producer-node">
              <strong>Producer</strong>
              <small>emits {latest}</small>
            </div>
            <div className={`flow-wire ${flowType === 'StateFlow' ? 'state-wire' : 'shared-wire'}`}>
              {liveTokens.map((item, index) => (
                <span
                  className={`moving-token token-${index}`}
                  key={`${item}-${index}-${events.length}`}
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="collector-fanout" aria-hidden="true">
              {Array.from({ length: Math.min(collectors, 4) }, (_, index) => (
                <i key={index} />
              ))}
            </div>
          </div>
          <div className="replay-cache">
            <strong>{flowType === 'StateFlow' ? 'Current value' : 'Replay cache'}</strong>
            <p className="mini-copy">
              {flowType === 'StateFlow'
                ? 'The old value is replaced. There is no history, only now.'
                : 'Replay is the small history handed to a collector that arrives late.'}
            </p>
            <div>
              {replayCache.length === 0 ? (
                <span className="empty-token">empty</span>
              ) : (
                replayCache.map((item, index) => (
                  <span className={index === replayCache.length - 1 ? 'latest-token' : ''} key={`${item}-${index}`}>
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="collector-grid">
            {Array.from({ length: collectors }, (_, index) => (
              <div className={`collector-node ${lateCollector && index === collectors - 1 ? 'late' : ''}`} key={index}>
                Collector {index + 1}
                <small>
                  {lateCollector && index === collectors - 1
                    ? flowType === 'StateFlow'
                      ? `arrives late, gets ${latest}`
                      : visibleReplay
                        ? `arrives late, replays ${replayCache.join(', ')}`
                        : 'arrives late, gets nothing old'
                    : `live receives ${latest}`}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="decision-panel">
          <div className="eyebrow green">
            <SlidersHorizontal size={16} />
            Decision
          </div>
          <p>{recommendation}</p>
          <div className="explain-row">
            <strong>New collector</strong>
            <span>{newCollectorReceives}</span>
          </div>
          <div className="buffer-row">
            <strong>Buffered</strong>
            <span>{buffered.length ? buffered.join(', ') : flowType === 'StateFlow' ? 'not configurable' : 'none'}</span>
          </div>
          <div className="explain-row">
            <strong>Common mistake</strong>
            <span>
              {flowType === 'StateFlow'
                ? 'Do not use it for one-time navigation or snackbar events; the last event can be delivered again.'
                : 'Do not use replay casually; replayed events can repeat side effects for late collectors.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FlowChoiceWidget;

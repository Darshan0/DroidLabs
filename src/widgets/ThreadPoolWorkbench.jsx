import { useEffect, useMemo, useState } from 'react';
import { Cpu, Plus } from 'lucide-react';

const poolConfig = {
  fixed: {
    label: 'Fixed pool',
    core: 10,
    max: 10,
    queue: 'unbounded queue',
    metaphor: 'Four cashiers and one long waiting line.',
    use: 'Use when you want to cap concurrency and can tolerate queued work.',
    trap: 'The thread count is bounded, but the queue can still grow.',
  },
  cached: {
    label: 'Cached pool',
    core: 0,
    max: 12,
    queue: 'direct handoff',
    metaphor: 'Hire a new cashier whenever no idle cashier is ready.',
    use: 'Use for many short-lived tasks that do not block for long.',
    trap: 'Blocking tasks can create too many threads.',
  },
  single: {
    label: 'Single thread',
    core: 1,
    max: 1,
    queue: 'ordered queue',
    metaphor: 'One cashier. Every task stays in order.',
    use: 'Use when ordering is more important than throughput.',
    trap: 'One slow task blocks every task behind it.',
  },
};

function ThreadPoolWorkbench() {
  const [pool, setPool] = useState('fixed');
  const [tasks, setTasks] = useState(11);
  const config = poolConfig[pool];

  const model = useMemo(() => {
    const activeThreads = pool === 'cached' ? Math.min(tasks, config.max) : Math.min(tasks, config.core);
    const queued = pool === 'cached' ? 0 : Math.max(0, tasks - activeThreads);
    const risk =
      pool === 'cached' && tasks > 8
        ? 'Risk: thread explosion if tasks block for too long.'
        : queued > 4
          ? 'Risk: queue growth hides latency and memory pressure.'
          : 'Healthy for this workload.';

    return { activeThreads, queued, risk };
  }, [config, pool, tasks]);

  useEffect(() => {
    const handleCue = (event) => {
      if (event.detail?.postId !== 'thread-pools') return;

      if (event.detail.cue === 'fixed-overflow') {
        setPool('fixed');
        setTasks(11);
      }
      if (event.detail.cue === 'cached-burst') {
        setPool('cached');
        setTasks(11);
      }
      if (event.detail.cue === 'single-line') {
        setPool('single');
        setTasks(8);
      }
    };

    window.addEventListener('droidlab:cue', handleCue);
    return () => window.removeEventListener('droidlab:cue', handleCue);
  }, []);

  return (
    <section className="widget thread-widget">
      <div className="widget-header">
        <div className="eyebrow green">
          <Cpu size={18} />
          Thread Pool Workbench
        </div>
        <button type="button" className="primary-button" onClick={() => setTasks((current) => Math.min(20, current + 1))}>
          <Plus size={14} />
          Add job
        </button>
      </div>

      <div className="intuition-panel">
        <strong>Intuition</strong>
        <p>
          A thread pool is not just “how many threads.” It is a deal between workers and a queue. Move the slider
          and watch whether pressure becomes more threads or more waiting tasks.
        </p>
      </div>

      <div className="thread-grid">
        <div className="config-panel">
          <div className="pool-choice-row">
            {Object.entries(poolConfig).map(([key, item]) => (
              <button type="button" className={pool === key ? 'active' : ''} key={key} onClick={() => setPool(key)}>
                {item.label}
              </button>
            ))}
          </div>
          <label>
            <span>Submitted jobs: {tasks}</span>
            <input type="range" min="1" max="14" value={tasks} onChange={(event) => setTasks(Number(event.target.value))} />
          </label>
        </div>

        <div className="pool-visual">
          <div className="pool-caption">
            <strong>{config.metaphor}</strong>
            <span>
              {pool === 'cached'
                ? 'No queue is shown because a cached pool tries to hand work directly to an idle or new thread.'
                : 'Tasks beyond available workers wait in the queue.'}
            </span>
          </div>
          <div className="thread-lanes">
            {Array.from({ length: Math.max(config.core, model.activeThreads) || 1 }, (_, index) => (
              <span className={index < model.activeThreads ? 'busy' : ''} key={index}>
                <b>T{index + 1}</b>
                <small>{index < model.activeThreads ? 'running job' : 'idle'}</small>
              </span>
            ))}
          </div>
          <div className="queue-visual">
            <strong>{config.queue}</strong>
            <div>
              {Array.from({ length: model.queued }, (_, index) => (
                <span key={index}>task</span>
              ))}
              {model.queued === 0 && <em>no waiting tasks</em>}
            </div>
          </div>
        </div>

        <div className="decision-panel">
          <strong>{config.label}</strong>
          <p>
            Active threads: {model.activeThreads}. Queued tasks: {model.queued}. {model.risk}
          </p>
          <div className="explain-row">
            <strong>Use when</strong>
            <span>{config.use}</span>
          </div>
          <div className="explain-row">
            <strong>Trap</strong>
            <span>{config.trap}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThreadPoolWorkbench;

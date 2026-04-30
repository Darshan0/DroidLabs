import { useState } from 'react';
import { Cpu } from 'lucide-react';

function ThreadLaneWidget() {
  const [tasks, setTasks] = useState([
    { id: 'ui', label: 'draw frame', lane: 'main' },
    { id: 'network', label: 'fetch JSON', lane: 'io' },
  ]);

  const addTask = (lane) => {
    const labels =
      lane === 'main' ? ['bind view', 'dispatch click', 'compose recomposition'] : ['read file', 'query DB', 'sync cache'];

    setTasks((current) => [
      ...current.slice(-7),
      {
        id: crypto.randomUUID(),
        label: labels[Math.floor(Math.random() * labels.length)],
        lane,
      },
    ]);
  };

  return (
    <section className="widget">
      <div className="widget-header">
        <div className="eyebrow green">
          <Cpu size={18} />
          Dispatcher Lanes
        </div>
        <div className="button-row">
          <button type="button" className="secondary-button compact" onClick={() => addTask('main')}>
            Main task
          </button>
          <button type="button" className="secondary-button compact" onClick={() => addTask('io')}>
            IO task
          </button>
        </div>
      </div>
      <div className="lane-board">
        {['main', 'io'].map((lane) => (
          <div className="lane" key={lane}>
            <strong>{lane === 'main' ? 'Dispatchers.Main' : 'Dispatchers.IO'}</strong>
            {tasks
              .filter((task) => task.lane === lane)
              .map((task) => (
                <span className="task-pill" key={task.id}>
                  {task.label}
                </span>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ThreadLaneWidget;

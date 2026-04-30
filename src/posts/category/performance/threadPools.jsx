import { Cpu } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock.jsx';
import DocsReferences from '../../../components/DocsReferences.jsx';
import LabCue from '../../../components/LabCue.jsx';
import Quiz from '../../../components/Quiz.jsx';
import ThreadPoolWorkbench from '../../../widgets/ThreadPoolWorkbench.jsx';

const threadPoolsPost = {
  id: 'thread-pools',
  title: 'Thread Pools: Fixed, Cached, Single, And The Queue You Forgot',
  category: 'Performance',
  date: 'April 29, 2026',
  readTime: '15 min read',
  excerpt: 'Submit tasks into different executor shapes and watch threads, queues, and risk move.',
  icon: <Cpu />,
  widget: <ThreadPoolWorkbench />,
  content: (
    <>
      <h2>A Thread Pool Is Two Things</h2>
      <p>
        Most engineers talk about thread count and forget the queue. A pool is a policy for creating workers and
        a policy for storing work that cannot run yet. The queue is where latency and memory pressure hide.
      </p>
      <p className="key-line">
        Important: a thread pool failure is usually either too many threads or too much queued work.
      </p>
      <LabCue postId="thread-pools" cue="fixed-overflow">
        Put 11 jobs into a fixed pool of 10
      </LabCue>

      <h2>Fixed Pool: Stable Workers, Growing Queue</h2>
      <p>
        A fixed pool caps active threads. That protects the machine from unbounded thread creation, but submitted
        work can pile up behind the fixed workers.
      </p>
      <p>
        Think of a fixed pool as four workers at a service desk. The fifth request waits. That is good when you
        must protect CPU or a backend service, but bad if callers assume work starts immediately.
      </p>
      <LabCue postId="thread-pools" cue="fixed-overflow">
        Show fixed pool pressure
      </LabCue>
      <CodeBlock
        language="java"
        code={`
ExecutorService fixed = Executors.newFixedThreadPool(4);

for (Request request : requests) {
    fixed.submit(() -> process(request));
}

fixed.shutdown();
        `}
      />

      <h2>Cached Pool: Fast Growth, Dangerous With Blocking Work</h2>
      <p>
        A cached pool can create new threads as demand arrives and reuse idle threads. This can be useful for many
        short asynchronous tasks, but dangerous when tasks block for a long time.
      </p>
      <p className="key-line">
        Important: cached pools reduce waiting by growing threads; they do not make blocking work free.
      </p>
      <LabCue postId="thread-pools" cue="cached-burst">
        Show cached pool burst
      </LabCue>
      <CodeBlock
        language="java"
        code={`
ExecutorService cached = Executors.newCachedThreadPool();

cached.submit(() -> downloadAvatar(userId));
cached.submit(() -> warmDiskCache());
cached.shutdown();
        `}
      />

      <h2>Single Thread: Ordered Work</h2>
      <p>
        A single-thread executor is not for speed. It is for order. Use it when tasks must not overlap: serial file
        writes, ordered event processing, or a legacy component that is not thread-safe.
      </p>
      <p>
        The cost is head-of-line blocking. If the first task takes five seconds, every task behind it waits five
        seconds even if those later tasks are tiny.
      </p>
      <LabCue postId="thread-pools" cue="single-line">
        Show ordered single-thread queue
      </LabCue>
      <CodeBlock
        language="java"
        code={`
ExecutorService serial = Executors.newSingleThreadExecutor();

serial.submit(() -> writeAuditEvent(event));
serial.submit(() -> writeAuditEvent(nextEvent));
serial.shutdown();
        `}
      />

      <Quiz
        question="You have 10,000 blocking network tasks and use a cached thread pool. What is the main risk?"
        options={['Tasks execute in strict order', 'Too many threads are created', 'Only one task can run']}
        answer="Too many threads are created"
        explanation="Cached pools can grow aggressively when no idle thread is available. Blocking tasks can turn that into thread explosion."
      />

      <h2>The Production Lesson</h2>
      <p>
        Pick the pool by failure mode. Fixed pools bound threads but can hide queue growth. Cached pools reduce
        waiting but can explode under blocking load. Single-thread pools preserve order at the cost of parallelism.
      </p>
      <CodeBlock
        language="java"
        code={`
ThreadPoolExecutor bounded = new ThreadPoolExecutor(
    4, 4,
    0L, TimeUnit.MILLISECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
        `}
      />
      <p>
        In production, prefer explicit `ThreadPoolExecutor` configuration when the default executor shape hides a
        risk you care about: queue capacity, rejection policy, thread names, or shutdown behavior.
      </p>
      <DocsReferences
        links={[
          {
            label: 'Executors API reference',
            href: 'https://developer.android.com/reference/java/util/concurrent/Executors',
          },
          {
            label: 'ThreadPoolExecutor API reference',
            href: 'https://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor',
          },
        ]}
      />
    </>
  ),
};

export default threadPoolsPost;

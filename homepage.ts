import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Code2, 
  BookOpen, 
  RefreshCw, 
  ChevronRight, 
  ArrowLeft,
  Clock,
  Zap,
  Layers,
  Activity,
  Cpu,
  Share2,
  MousePointer2,
  Play,
  Trash2
} from 'lucide-react';

// --- SHARED COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// --- WIDGET 1: FLOW VISUALIZER ---
const FlowVisualizer = () => {
  const [emissions, setEmissions] = useState([]);
  const [debounceTime, setDebounceTime] = useState(500);
  const [isPaused, setIsPaused] = useState(false);
  const lastEmitTime = useRef(0);
  const timerRef = useRef(null);

  const emit = () => {
    const now = Date.now();
    const newEmission = {
      id: Math.random(),
      value: Math.floor(Math.random() * 100),
      timestamp: now,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      position: 0,
      isVaporized: false
    };

    setEmissions(prev => {
      // Logic for debounce: If new item comes before last item timer is up
      const updated = prev.map(e => {
        if (!e.isVaporized && now - e.timestamp < debounceTime) {
          return { ...e, isVaporized: true };
        }
        return e;
      });
      return [...updated, newEmission];
    });
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setEmissions(prev => 
        prev.map(e => ({ ...e, position: e.position + 2 }))
            .filter(e => e.position < 100)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-400" />
          <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Flow.debounce() Sandbox</h4>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsPaused(!isPaused)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <RefreshCw size={14} className={isPaused ? "" : "animate-spin-slow"} />
          </button>
          <button onClick={emit} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <Play size={12} fill="currentColor" /> EMIT VALUE
          </button>
        </div>
      </div>

      {/* The Pipe */}
      <div className="relative h-48 bg-slate-900 rounded-2xl border-x-4 border-slate-800 overflow-hidden flex items-center">
        <div className="absolute inset-y-0 left-1/4 w-[2px] bg-blue-500/30 z-0">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-mono">OPERATOR: DEBOUNCE</span>
        </div>
        
        {emissions.map(e => (
          <div 
            key={e.id}
            className="absolute transition-all duration-300 flex flex-col items-center"
            style={{ 
              left: `${e.position}%`, 
              opacity: e.isVaporized ? 0.2 : 1,
              transform: e.isVaporized ? 'scale(0.5) translateY(-20px)' : 'scale(1)'
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: e.color }}>
              {e.value}
            </div>
            {e.isVaporized && <span className="text-[8px] text-red-500 font-bold mt-1 uppercase">Dropped</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <label className="text-[10px] text-slate-500 font-bold block mb-2 uppercase tracking-tighter">Debounce Delay ({debounceTime}ms)</label>
          <input 
            type="range" min="100" max="2000" step="100" 
            value={debounceTime} 
            onChange={(e) => setDebounceTime(Number(e.target.value))}
            className="w-full accent-blue-500" 
          />
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-[10px]">
          <p className="text-slate-500 leading-relaxed italic">
            "Notice how rapid emissions are vaporized if they occur within the delay window. Only the last marble survives the gate."
          </p>
        </div>
      </div>
    </div>
  );
};

// --- WIDGET 2: FRAGMENT LIFECYCLE ---
const FragmentWidget = () => {
  const [stage, setStage] = useState(0);
  const stages = [
    { name: 'onAttach', desc: 'Fragment is first connected to the Activity context.' },
    { name: 'onCreate', desc: 'Initial creation logic, similar to an object constructor.' },
    { name: 'onCreateView', desc: 'The UI is inflated here. The "Visual" is born.' },
    { name: 'onStart', desc: 'Fragment becomes visible but not interactive.' },
    { name: 'onResume', desc: 'Fragment is now at the top of the stack and interactive.' }
  ];

  return (
    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex gap-8 h-80">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-amber-400" />
          <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Lifecycle Heartbeat</h4>
        </div>
        <div className="space-y-3">
          {stages.map((s, i) => (
            <div key={s.name} className={`flex items-center gap-4 transition-all duration-300 ${i === stage ? 'translate-x-2' : 'opacity-30'}`}>
              <div className={`w-2 h-2 rounded-full ${i <= stage ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-slate-700'}`} />
              <span className={`text-xs font-mono ${i === stage ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>{s.name}()</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center text-center">
        <div className={`w-24 h-32 rounded-xl border-2 transition-all duration-500 flex flex-col ${stage >= 2 ? 'bg-white border-white' : 'border-dashed border-slate-700'}`}>
           <div className="h-2 bg-slate-200 rounded-t-lg mb-2"></div>
           {stage >= 2 ? <div className="p-2 space-y-1"><div className="h-1 w-full bg-blue-100 rounded"></div><div className="h-1 w-3/4 bg-blue-100 rounded"></div></div> : null}
        </div>
        <p className="mt-4 text-[11px] text-slate-400">{stages[stage].desc}</p>
        <button 
          onClick={() => setStage((stage + 1) % stages.length)}
          className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest"
        >
          {stage === stages.length - 1 ? "Re-Initialize" : "Next Phase"}
        </button>
      </div>
    </div>
  );
};

// --- DATA: POSTS ---
const POSTS = [
  {
    id: 'flow-operators',
    title: "The Line That Waits Its Turn",
    category: "Coroutines",
    date: "April 28, 2026",
    readTime: "8 min read",
    excerpt: "Why debounce(0) isn't zero, how Flow buffers actually work, and why SharedFlow is the most misunderstood tool in your SDK.",
    icon: <Zap className="text-blue-400" />,
    widget: <FlowVisualizer />,
    content: (
      <div className="prose prose-invert max-w-none space-y-6 text-slate-400 leading-relaxed">
        <p>In Android development, we often think of data streams as continuous pipes. But in reality, they are more like ticket counters. If too many people show up at once, the system needs to decide who gets served and who gets ignored.</p>
        <h3 className="text-white text-xl font-bold mt-8 mb-4">The Debounce Abstraction</h3>
        <p>Imagine a search bar. If you emit a network call on every single keystroke, you'll DDOS your own server. Debounce is the "waiter." It looks at the incoming stream and says: "I won't act until you stop talking for at least 500ms."</p>
        <p className="italic text-slate-500 py-4 border-l-2 border-slate-800 pl-4">"Pry it open below. Try emitting values rapidly and watch how the debounce window 'vaporizes' the premature emissions."</p>
      </div>
    )
  },
  {
    id: 'fragment-lifecycle',
    title: "The Invisible Hand of Lifecycle",
    category: "Architecture",
    date: "April 26, 2026",
    readTime: "12 min read",
    excerpt: "A Fragment is a ghost in the machine. It lives, dies, and is resurrected by the OS. Understanding the 'View' vs 'Fragment' lifecycle is key to avoiding memory leaks.",
    icon: <Layers className="text-amber-400" />,
    widget: <FragmentWidget />,
    content: (
      <div className="prose prose-invert max-w-none space-y-6 text-slate-400 leading-relaxed">
        <p>Most developers treat <code>onCreateView</code> as the birth of a Fragment. But the Fragment is actually born much earlier, during <code>onAttach</code>. It's during this phase that the Fragment gets its first taste of the outside world: the Activity context.</p>
        <h3 className="text-white text-xl font-bold mt-8 mb-4">View Recycling vs. Instance Destruction</h3>
        <p>One of the most leaky patterns in Android is holding a reference to a View in a Fragment after <code>onDestroyView</code> has been called. The Fragment instance might live on, but the View is dead. Holding that reference is like holding a ghost's hand—it leads nowhere and keeps memory hostage.</p>
      </div>
    )
  }
];

// --- MAIN APP COMPONENT ---

const App = () => {
  const [activePost, setActivePost] = useState(null);

  // Simple Router logic
  const navigateTo = (post) => {
    setActivePost(post);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 font-sans">
      
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActivePost(null)}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight leading-none">DroidLab</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Explorable Insights</p>
            </div>
          </div>

          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Experiments</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Manifesto</a>
            <a href="#" className="text-blue-500">Blog</a>
          </div>
        </div>
      </header>

      {activePost ? (
        /* DETAIL VIEW */
        <main className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <button 
            onClick={() => setActivePost(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 text-sm font-bold group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
          </button>

          <header className="space-y-6 mb-16">
            <div className="flex items-center gap-3 text-blue-400 text-xs font-bold uppercase tracking-widest">
              <span className="bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">{activePost.category}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{activePost.date}</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight">{activePost.title}</h1>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><Clock size={14} /> {activePost.readTime}</div>
              <div className="flex items-center gap-2"><Share2 size={14} className="hover:text-white cursor-pointer" /> Share</div>
            </div>
          </header>

          <article className="mb-16">
            {activePost.content}
          </article>

          {/* THE "POKEABLE" WIDGET */}
          <div className="my-20">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                <MousePointer2 className="text-blue-400" /> Interaction Sandbox
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">FIGURE 1.0 // LIVE STATE</span>
            </div>
            {activePost.widget}
          </div>

          <footer className="border-t border-slate-800 pt-12 mt-32 flex justify-between items-center">
            <div className="text-slate-500 text-sm italic">
              "All non-trivial abstractions, to some degree, are leaky." — Joel Spolsky
            </div>
            <button className="bg-slate-900 px-6 py-3 rounded-2xl hover:bg-slate-800 transition-colors font-bold text-sm">
              Subscribe to Insights
            </button>
          </footer>
        </main>
      ) : (
        /* HOME FEED VIEW */
        <main className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-20 space-y-4">
            <h2 className="text-6xl font-black text-white tracking-tighter">Pry the abstraction open.</h2>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-serif italic">
              Engineering essays for people who'd rather poke at a live system than read about it. One Android question per post.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POSTS.map(post => (
              <Card key={post.id} className="group cursor-pointer">
                <div onClick={() => navigateTo(post)} className="p-8 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:bg-slate-800 transition-colors">
                        {post.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{post.date}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight">{post.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{post.excerpt}</p>
                    </div>
                  </div>
                  <div className="mt-12 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-600">
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.category}</span>
                    </div>
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-all">
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Callout */}
          <div className="mt-32 p-12 bg-blue-600 rounded-[3rem] text-center space-y-6 relative overflow-hidden">
             <Cpu size={200} className="absolute -bottom-20 -right-20 text-blue-500/20 rotate-12" />
             <h3 className="text-4xl font-black text-white relative z-10 tracking-tight">Level up your Android IQ.</h3>
             <p className="text-blue-100 relative z-10 max-w-xl mx-auto">Get monthly interactive deep-dives into memory management, rendering performance, and async logic.</p>
             <div className="pt-4 relative z-10">
               <button className="bg-white text-blue-600 px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-transform">Join the Newsletter</button>
             </div>
          </div>
        </main>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #010409; }
        ::-webkit-scrollbar-thumb { background: #161b22; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #30363d; }
      `}</style>
    </div>
  );
};

export default App;
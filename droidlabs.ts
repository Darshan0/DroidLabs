import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Code2, 
  BookOpen, 
  Layers, 
  Trash2, 
  Box, 
  Type, 
  Square, 
  RefreshCw,
  Info,
  ChevronRight,
  Monitor,
  Image as ImageIcon,
  Loader2,
  ToggleRight,
  CheckSquare,
  List,
  MousePointer2,
  Layout,
  Maximize,
  GripVertical,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const App = () => {
  const [hierarchy, setHierarchy] = useState([
    { id: 'root', type: 'LinearLayout', props: { orientation: 'vertical', padding: '16dp' }, children: [] }
  ]);
  const [selectedId, setSelectedId] = useState('root');
  const [activeTab, setActiveTab] = useState('xml');
  const [lastAction, setLastAction] = useState(null);
  const [showXRay, setShowXRay] = useState(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  
  // XML Editing State
  const [xmlCode, setXmlCode] = useState('');
  const [xmlError, setXmlError] = useState(null);
  const isInternalUpdate = useRef(false);

  const componentConfig = {
    LinearLayout: {
      category: 'Layouts',
      isContainer: true,
      icon: <Layers size={18} />,
      doc: "Aligns children in a single direction (vertical/horizontal). It uses 'weight' to distribute space among children during the measurement pass.",
      xmlTag: 'LinearLayout',
      xml: (props, children) => `<LinearLayout\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="${props.orientation || 'vertical'}"\n    android:padding="${props.padding || '0dp'}">\n${children}\n</LinearLayout>`,
      lifecycle: ["onMeasure", "onLayout", "onDraw"]
    },
    ConstraintLayout: {
      category: 'Layouts',
      isContainer: true,
      icon: <Layout size={18} />,
      doc: "The modern standard. It uses a flat view hierarchy and constraint solvers to position views, significantly improving rendering performance over nested layouts.",
      xmlTag: 'androidx.constraintlayout.widget.ConstraintLayout',
      xml: (props, children) => `<androidx.constraintlayout.widget.ConstraintLayout\n    android:layout_width="match_parent"\n    android:layout_height="match_parent">\n${children}\n</androidx.constraintlayout.widget.ConstraintLayout>`,
      lifecycle: ["onMeasure", "onLayout", "onDraw", "solveConstraints"]
    },
    FrameLayout: {
      category: 'Layouts',
      isContainer: true,
      icon: <Maximize size={18} />,
      doc: "Designed to block out an area on the screen to display a single item. Generally used as a container for Fragments.",
      xmlTag: 'FrameLayout',
      xml: (props, children) => `<FrameLayout\n    android:layout_width="match_parent"\n    android:layout_height="match_parent">\n${children}\n</FrameLayout>`,
      lifecycle: ["onMeasure", "onLayout", "onDraw"]
    },
    TextView: {
      category: 'Widgets',
      isContainer: false,
      icon: <Type size={18} />,
      doc: "Displays text. It handles Unicode, spans for styling, and interacts with the 'TextWatcher' system.",
      xmlTag: 'TextView',
      xml: (props) => `    <TextView\n        android:layout_width="wrap_content"\n        android:layout_height="wrap_content"\n        android:text="${props.text || 'Hello DroidLab'}" />`,
      lifecycle: ["onMeasure", "onDraw"]
    },
    Button: {
      category: 'Widgets',
      isContainer: false,
      icon: <Square size={18} />,
      doc: "Handles touch interactions. It triggers 'performClick()' when a user releases a tap within its boundaries.",
      xmlTag: 'Button',
      xml: (props) => `    <Button\n        android:layout_width="match_parent"\n        android:layout_height="wrap_content"\n        android:text="${props.text || 'Action Button'}" />`,
      lifecycle: ["onMeasure", "onDraw", "onTouchEvent"]
    },
    ImageView: {
      category: 'Widgets',
      isContainer: false,
      icon: <ImageIcon size={18} />,
      doc: "Displays bitmap or vector images. It handles 'ScaleType' (like centerCrop) to determine how the image fits its bounds.",
      xmlTag: 'ImageView',
      xml: (props) => `    <ImageView\n        android:layout_width="100dp"\n        android:layout_height="100dp"\n        android:src="@drawable/sample_image" />`,
      lifecycle: ["onMeasure", "onDraw", "setImageBitmap"]
    },
    ProgressBar: {
      category: 'Widgets',
      isContainer: false,
      icon: <Loader2 size={18} />,
      doc: "Visualizes progress. For 'indeterminate' mode, it runs an animation thread that invalidates the view frequently.",
      xmlTag: 'ProgressBar',
      xml: (props) => `    <ProgressBar\n        android:layout_width="wrap_content"\n        android:layout_height="wrap_content" />`,
      lifecycle: ["onDraw", "onVisibilityChanged", "postInvalidate"]
    },
    Switch: {
      category: 'Widgets',
      isContainer: false,
      icon: <ToggleRight size={18} />,
      doc: "A toggle switch. It extends CompoundButton and tracks an internal 'isChecked' state.",
      xmlTag: 'Switch',
      xml: (props) => `    <Switch\n        android:layout_width="wrap_content"\n        android:layout_height="wrap_content"\n        android:text="Toggle Me" />`,
      lifecycle: ["onMeasure", "onDraw", "toggle"]
    },
    CheckBox: {
      category: 'Widgets',
      isContainer: false,
      icon: <CheckSquare size={18} />,
      doc: "A two-state button that can be checked or unchecked.",
      xmlTag: 'CheckBox',
      xml: (props) => `    <CheckBox\n        android:layout_width="wrap_content"\n        android:layout_height="wrap_content"\n        android:text="Check This" />`,
      lifecycle: ["onMeasure", "onDraw", "setChecked"]
    },
    RecyclerView: {
      category: 'Advanced',
      isContainer: false,
      icon: <List size={18} />,
      doc: "Recycles ViewHolders to maintain performance for large lists.",
      xmlTag: 'androidx.recyclerview.widget.RecyclerView',
      xml: (props) => `    <androidx.recyclerview.widget.RecyclerView\n        android:layout_width="match_parent"\n        android:layout_height="match_parent" />`,
      lifecycle: ["onLayoutChildren", "scrollBy", "onBindViewHolder"]
    },
    FragmentContainer: {
      category: 'Advanced',
      isContainer: false,
      icon: <Box size={18} />,
      doc: "Placeholder for dynamically swapped Fragments.",
      xmlTag: 'androidx.fragment.app.FragmentContainerView',
      xml: (props) => `    <androidx.fragment.app.FragmentContainerView\n        android:layout_width="match_parent"\n        android:layout_height="match_parent" />`,
      lifecycle: ["onAttach", "onCreate", "onCreateView", "onStart"]
    }
  };

  // Helper to get tag from component type
  const getTagFromType = (type) => componentConfig[type]?.xmlTag || type;
  const getTypeFromTag = (tag) => {
    const entry = Object.entries(componentConfig).find(([_, cfg]) => cfg.xmlTag === tag);
    return entry ? entry[0] : null;
  };

  // Generate XML from Hierarchy
  const generateXML = useCallback((list) => {
    const build = (comp) => {
      const childrenXML = comp.children.map(c => build(c)).join('\n');
      return componentConfig[comp.type].xml(comp.props, childrenXML);
    };
    return build(list[0]);
  }, []);

  // Update XML whenever hierarchy changes (from Drag & Drop)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setXmlCode(generateXML(hierarchy));
    setXmlError(null);
  }, [hierarchy, generateXML]);

  // Parse XML back to Hierarchy
  const parseXMLToHierarchy = (xmlString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, "application/xml");
      const errorNode = doc.querySelector("parsererror");
      if (errorNode) throw new Error("Invalid XML Syntax");

      const rootElement = doc.documentElement;
      
      const buildNode = (el) => {
        const type = getTypeFromTag(el.tagName);
        if (!type) return null;

        // Parse basic attributes as props
        const props = {};
        for (let attr of el.attributes) {
          const name = attr.name.replace('android:', '');
          props[name] = attr.value;
        }

        return {
          id: `id_${Math.random().toString(36).substr(2, 9)}`,
          type,
          props,
          children: Array.from(el.children).map(child => buildNode(child)).filter(Boolean)
        };
      };

      const newHierarchy = [buildNode(rootElement)].filter(Boolean);
      if (newHierarchy.length > 0) {
        isInternalUpdate.current = true;
        setHierarchy(newHierarchy);
        setXmlError(null);
      }
    } catch (err) {
      setXmlError(err.message);
    }
  };

  const handleXmlChange = (e) => {
    const newCode = e.target.value;
    setXmlCode(newCode);
    parseXMLToHierarchy(newCode);
  };

  // State Manipulation (Canvas D&D)
  const addComponentToHierarchy = useCallback((type, targetId) => {
    const newId = `id_${Math.random().toString(36).substr(2, 9)}`;
    const newComponent = { id: newId, type, props: {}, children: [] };
    
    setHierarchy(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const process = (list) => {
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (item.id === targetId) {
            if (componentConfig[item.type].isContainer) {
              item.children.push(newComponent);
            } else {
              list.splice(i + 1, 0, newComponent);
            }
            return true;
          }
          if (item.children.length > 0) {
            if (process(item.children)) return true;
          }
        }
        return false;
      };

      if (!process(updated)) updated[0].children.push(newComponent);
      return updated;
    });
    
    setSelectedId(newId);
    setLastAction(`Added ${type}`);
    setTimeout(() => setLastAction(null), 2000);
  }, []);

  const removeComponent = (id) => {
    if (id === 'root') return;
    setHierarchy(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const removeFromChildren = (list) => {
        const index = list.findIndex(c => c.id === id);
        if (index > -1) {
          list.splice(index, 1);
          return true;
        }
        return list.some(c => removeFromChildren(c.children));
      };
      removeFromChildren(updated);
      return updated;
    });
    setSelectedId('root');
  };

  const findComponent = (id, list = hierarchy) => {
    for (const item of list) {
      if (item.id === id) return item;
      const found = findComponent(id, item.children);
      if (found) return found;
    }
    return null;
  };

  const selectedComp = findComponent(selectedId) || hierarchy[0];

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('componentType', type);
    setIsDraggingSidebar(true);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData('componentType');
    if (type) addComponentToHierarchy(type, targetId);
  };

  const renderCanvasComponent = (comp) => {
    const isSelected = selectedId === comp.id;
    const isContainer = componentConfig[comp.type].isContainer;
    
    const containerClasses = `
      relative group transition-all p-3 rounded-lg border-2
      ${isSelected ? 'ring-4 ring-blue-500/30 border-blue-500 z-10' : 'border-slate-200 border-dashed hover:border-blue-400'}
      ${isContainer ? 'min-h-[60px] bg-slate-50/20' : 'bg-white shadow-sm'}
    `;

    const renderContent = () => {
      switch(comp.type) {
        case 'TextView': return <span className="text-slate-800 text-[10px]">{comp.props.text || 'Hello DroidLab!'}</span>;
        case 'Button': return <div className="bg-blue-600 text-white shadow-md text-center font-bold py-1.5 rounded text-[10px] uppercase tracking-wider">{comp.props.text || 'Button'}</div>;
        case 'ImageView': return <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400 mx-auto"><ImageIcon size={20}/></div>;
        case 'ProgressBar': return <div className="flex justify-center"><Loader2 size={20} className="text-blue-500 animate-spin" /></div>;
        case 'Switch': return <div className="flex items-center justify-between"><span className="text-[9px] text-slate-600">{comp.props.text || 'Toggle'}</span><div className="w-7 h-3.5 bg-blue-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div></div></div>;
        case 'CheckBox': return <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-slate-300 rounded bg-blue-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div><span className="text-[9px] text-slate-600">Option</span></div>;
        case 'RecyclerView': return <div className="space-y-1">{[1,2].map(i => <div key={i} className="h-6 bg-slate-100 rounded border border-slate-200 flex items-center px-2 text-[7px] text-slate-400">ViewHolder @{i}</div>)}</div>;
        case 'FragmentContainer': return <div className="min-h-[60px] bg-amber-50/30 flex flex-col items-center justify-center text-amber-800 text-[8px] text-center border border-amber-200 rounded px-2"><span>[ Fragment ]</span></div>;
        default: return (
          <div className={`flex gap-2 flex-col`}>
            {comp.children.length === 0 ? (
              <div className="h-10 flex items-center justify-center text-[9px] text-slate-400 italic bg-slate-400/5 rounded">Drop content here</div>
            ) : (
              comp.children.map(c => renderCanvasComponent(c))
            )}
          </div>
        );
      }
    };

    return (
      <div key={comp.id} onDrop={(e) => handleDrop(e, comp.id)} onDragOver={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }} className={containerClasses}>
        {renderContent()}
        <div className="absolute -top-2 left-1 bg-blue-500 text-white text-[6px] font-bold px-1 py-0.5 rounded uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {comp.type}
        </div>
        {isSelected && comp.id !== 'root' && (
          <button onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }} className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 z-20">
            <Trash2 size={10} />
          </button>
        )}
      </div>
    );
  };

  const categories = ['Layouts', 'Widgets', 'Advanced'];

  return (
    <div className="flex h-screen bg-[#0d1117] text-slate-300 font-sans overflow-hidden select-none">
      
      {/* 1. Sidebar Palette */}
      <aside className="w-64 border-r border-slate-800 bg-[#0d1117] flex flex-col z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Smartphone size={20} />
            <h1 className="font-bold tracking-tight text-lg">DroidLab</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lainlog Style IDE</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-[11px] font-bold text-slate-500 uppercase mb-3 px-2 tracking-wider">{cat}</h2>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(componentConfig).filter(([_, cfg]) => cfg.category === cat).map(([type, config]) => (
                  <div key={type} draggable onDragStart={(e) => handleDragStart(e, type)} onDragEnd={() => setIsDraggingSidebar(false)} className="w-full group flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 text-left cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${cat === 'Layouts' ? 'bg-indigo-500/10 text-indigo-400' : cat === 'Advanced' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {config.icon}
                      </div>
                      <span className="text-xs font-medium">{type}</span>
                    </div>
                    <GripVertical size={12} className="text-slate-700 group-hover:text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* 2. Main Phone Canvas */}
      <main className="flex-1 flex flex-col bg-[#010409] relative overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0d1117]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button onClick={() => setShowXRay(!showXRay)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${showXRay ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
                <RefreshCw size={12} className={showXRay ? 'animate-spin-slow' : ''} /> X-RAY
              </button>
            </div>
          </div>
          {lastAction && <div className="absolute left-1/2 -translate-x-1/2 top-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-xl animate-bounce">{lastAction}</div>}
        </header>

        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className={`relative w-[min(280px,100%)] h-full max-h-[540px] bg-white rounded-[2.5rem] shadow-[0_0_0_10px_#1c2128,0_0_60px_rgba(0,0,0,0.5)] transition-all duration-500 ${showXRay ? 'rotate-[-2deg] scale-90' : ''}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1c2128] rounded-b-xl z-20"></div>
            <div className={`absolute inset-0 m-1 bg-white rounded-[2.3rem] overflow-hidden flex flex-col ${showXRay ? 'opacity-30' : ''}`}>
              <div className="h-5 bg-slate-100 flex items-center justify-end px-6 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <div className="w-3 h-1.5 rounded-full bg-slate-300"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-3" onDrop={(e) => handleDrop(e, 'root')} onDragOver={(e) => e.preventDefault()} onClick={() => setSelectedId('root')}>
                {renderCanvasComponent(hierarchy[0])}
              </div>
              <div className="h-10 bg-slate-100 flex items-center justify-around px-12">
                 <div className="w-3 h-3 rounded-sm border-[1.5px] border-slate-300"></div>
                 <div className="w-3 h-3 rounded-full border-[1.5px] border-slate-300"></div>
                 <div className="w-3 h-3 border-l-[1.5px] border-b-[1.5px] rotate-45 border-slate-300"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Code & Documentation Panel */}
      <aside className="w-[450px] border-l border-slate-800 bg-[#0d1117] flex flex-col">
        <div className="flex bg-[#161b22] border-b border-slate-800">
          <button onClick={() => setActiveTab('xml')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 ${activeTab === 'xml' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-slate-500'}`}>XML Layout</button>
          <button onClick={() => setActiveTab('doc')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 ${activeTab === 'doc' ? 'border-amber-500 text-white bg-white/5' : 'border-transparent text-slate-500'}`}>Engineering Docs</button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'xml' ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                  {xmlError ? <AlertCircle size={12} className="text-red-500" /> : <CheckCircle2 size={12} className="text-green-500" />}
                  {xmlError ? "Syntax Error" : "Synchronized"}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">activity_main.xml</span>
              </div>
              <textarea 
                value={xmlCode}
                onChange={handleXmlChange}
                spellCheck="false"
                className={`flex-1 w-full bg-[#010409] text-slate-300 p-4 font-mono text-[11px] rounded-xl border outline-none transition-colors leading-relaxed resize-none ${xmlError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'}`}
              />
              {xmlError && <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-mono">{xmlError}</div>}
            </div>
          ) : (
            <div className="p-6 space-y-6 overflow-y-auto">
              <section>
                <div className="flex items-center gap-2 text-amber-400 mb-3 font-bold text-sm"><Info size={16} /> {selectedComp.type} Deep Dive</div>
                <p className="text-slate-400 text-[11px] bg-slate-900/50 p-4 rounded-xl border border-slate-800 italic leading-relaxed">"{componentConfig[selectedComp.type].doc}"</p>
              </section>
              <section>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-widest"><RefreshCw size={10}/> Main-Thread Lifecycle</h4>
                <div className="space-y-2">
                  {componentConfig[selectedComp.type].lifecycle.map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border ${i === 0 ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{i + 1}</div>
                      <span className={`text-[10px] font-mono ${i === 0 ? 'text-blue-400 font-bold underline decoration-blue-900' : 'text-slate-500'}`}>{step}()</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </div>
  );
};

export default App;
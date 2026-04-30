import { useMemo, useState } from 'react';
import { BookOpen, Smartphone } from 'lucide-react';
import HeroDevice from './components/HeroDevice.jsx';
import PostDetail from './components/PostDetail.jsx';
import PostFeed from './components/PostFeed.jsx';
import { categories, posts } from './posts/index.jsx';

function App() {
  const [activePost, setActivePost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const visiblePosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  const openPost = (post) => {
    setActivePost(post);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closePost = () => {
    setActivePost(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={closePost}>
          <span className="brand-mark">
            <Smartphone size={21} />
          </span>
          <span>
            <strong>DroidLab</strong>
            <small>Explorable Android Insights</small>
          </span>
        </button>
        <nav aria-label="Primary navigation">
          <a href="#posts">Posts</a>
          <a href="#topics">Topics</a>
          <a href="https://developer.android.com/" target="_blank" rel="noreferrer">
            Android Docs
          </a>
        </nav>
      </header>

      {activePost ? (
        <PostDetail post={activePost} onBack={closePost} />
      ) : (
        <main>
          <section className="home-hero">
            <div>
              <p className="kicker">
                <BookOpen size={16} />
                Android internals, made pokeable
              </p>
              <h1>Learn Android by opening the machine.</h1>
              <p>
                Short engineering essays with live widgets for Coroutines, lifecycle, threading, UI rendering,
                and memory behavior.
              </p>
            </div>
            <HeroDevice />
          </section>

          <PostFeed
            categories={categories}
            activeCategory={activeCategory}
            posts={visiblePosts}
            onCategoryChange={setActiveCategory}
            onOpenPost={openPost}
          />
        </main>
      )}
    </div>
  );
}

export default App;

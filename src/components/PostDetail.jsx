import { ArrowLeft, Clock, Share2 } from 'lucide-react';

function PostDetail({ post, onBack }) {
  return (
    <main className="detail-view">
      <button type="button" className="back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to posts
      </button>

      <article>
        <header className="post-hero">
          <div className="post-meta">
            <span>{post.category}</span>
            <span>{post.date}</span>
          </div>
          <h1>{post.title}</h1>
          <div className="read-row">
            <span>
              <Clock size={16} />
              {post.readTime}
            </span>
            <button type="button">
              <Share2 size={16} />
              Share
            </button>
          </div>
        </header>

        <div className="lesson-layout">
          <div className="prose lesson-body">{post.content}</div>

          <aside className="sandbox-section sticky-sandbox" aria-label="Interactive illustration">
            {post.widget}
          </aside>
        </div>
      </article>
    </main>
  );
}

export default PostDetail;

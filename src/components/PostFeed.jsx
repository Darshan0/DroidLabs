import { ChevronRight } from 'lucide-react';
import Card from './Card.jsx';

function PostFeed({ categories, activeCategory, posts, onCategoryChange, onOpenPost }) {
  return (
    <section className="feed-section" id="posts">
      <div className="feed-toolbar" id="topics">
        <h2>Latest posts</h2>
        <div className="filter-row" aria-label="Filter posts by category">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? 'active' : ''}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <Card key={post.id} className="post-card">
            <button type="button" onClick={() => onOpenPost(post)}>
              <span className="card-icon">{post.icon}</span>
              <span className="card-date">{post.date}</span>
              <strong>{post.title}</strong>
              <span className="excerpt">{post.excerpt}</span>
              <span className="card-footer">
                <span>{post.readTime}</span>
                <span>{post.category}</span>
                <ChevronRight size={18} />
              </span>
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PostFeed;

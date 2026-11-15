
import { MessageCircle, Tag } from "lucide-react";

function PostCard({ post }) {
  const agent = post.agent || {};

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="agent-avatar">
          {(agent.name || "A").charAt(0).toUpperCase()}
        </div>

        <div className="post-author">
          <h3>{agent.name || "Unknown Agent"}</h3>
          <p>{agent.company || "Unknown Company"}</p>
        </div>

        <span className="post-category">
          {post.category || "General"}
        </span>
      </div>

      <p className="post-content">{post.content}</p>

      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={`${tag}-${index}`}>
              <Tag size={13} /> {tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-footer">
        <span>
          <MessageCircle size={16} />
          AI Agent Discussion
        </span>

        <span>
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString()
            : ""}
        </span>
      </div>
    </article>
  );
}

export default PostCard;

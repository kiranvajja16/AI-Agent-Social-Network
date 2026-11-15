
import { useEffect, useState } from "react";
import { Bot, FileText, RefreshCw } from "lucide-react";

import api from "../services/api";
import PostCard from "../components/PostCard";

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [postsResponse, agentsResponse] = await Promise.all([
        api.get("/posts"),
        api.get("/agents"),
      ]);

      const postsData = postsResponse.data;
      const agentsData = agentsResponse.data;

      setPosts(
        Array.isArray(postsData)
          ? postsData
          : postsData.posts || []
      );

      setAgents(
        Array.isArray(agentsData)
          ? agentsData
          : agentsData.agents || []
      );
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data. Check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor activity across your AI agent network.</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboardData}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Bot size={23} />
          </div>
          <div>
            <p>Total AI Agents</p>
            <h2>{agents.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={23} />
          </div>
          <div>
            <p>Total Posts</p>
            <h2>{posts.length}</h2>
          </div>
        </div>
      </div>

      <section className="feed-section">
        <div className="feed-heading">
          <div>
            <h2>Recent Posts</h2>
            <p>Discover what's happening in your agent network.</p>
          </div>
        </div>

        {loading ? (
          <p className="status-message">Loading dashboard...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : posts.length === 0 ? (
          <p className="status-message">
            No posts yet. Create your first post!
          </p>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

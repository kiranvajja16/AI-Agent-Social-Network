
import { useEffect, useState } from "react";
import { Send, FileText } from "lucide-react";
import api from "../services/api";

function CreatePost() {
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    agentId: "",
    content: "",
    category: "",
    tags: "",
    postType: "announcement",
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agents");
        const data = response.data;
        const agentList = Array.isArray(data)
          ? data
          : data.agents || [];

        setAgents(agentList.filter(
          (agent) => agent.status === "active"
        ));
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load registered agents."
        );
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!formData.agentId) {
      setError("Please select an AI agent.");
      return;
    }

    const payload = {
      agentId: formData.agentId,
      content: formData.content.trim(),
      category: formData.category.trim().toLowerCase(),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      postType: formData.postType,
    };

    try {
      setSubmitting(true);

      const response = await api.post("/posts", payload);

      setMessage(
        response.data.message || "Post published successfully!"
      );

      setFormData({
        agentId: "",
        content: "",
        category: "",
        tags: "",
        postType: "announcement",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to publish your post."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="page-heading">
        <div>
          <h1>Create Post</h1>
          <p>Share updates with relevant AI agents.</p>
        </div>
      </div>

      <div className="create-post-card">
        <div className="create-post-title">
          <div className="create-post-icon">
            <FileText size={23} />
          </div>
          <div>
            <h2>Publish a new post</h2>
            <p>Your post will be routed to relevant agents.</p>
          </div>
        </div>

        {message && (
          <div className="success-message">{message}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="agentId">Select AI Agent</label>

          <select
            id="agentId"
            name="agentId"
            value={formData.agentId}
            onChange={handleChange}
            required
            disabled={loadingAgents}
          >
            <option value="">
              {loadingAgents
                ? "Loading agents..."
                : "Choose an agent"}
            </option>

            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} — {agent.company}
              </option>
            ))}
          </select>

          <label htmlFor="postType">Post Type</label>

          <select
            id="postType"
            name="postType"
            value={formData.postType}
            onChange={handleChange}
          >
            <option value="announcement">Announcement</option>
            <option value="offer">Offer</option>
            <option value="update">Update</option>
          </select>

          <label htmlFor="category">Category</label>

          <input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Example: food, finance, technology"
            required
          />

          <label htmlFor="content">Post Content</label>

          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="What would your AI agent like to share?"
            maxLength={2000}
            rows={7}
            required
          />

          <div className="character-count">
            {formData.content.length}/2000 characters
          </div>

          <label htmlFor="tags">Tags</label>

          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="delivery, restaurants, food"
          />

          <p className="input-hint">
            Add multiple tags separated by commas.
          </p>

          <button
            type="submit"
            className="primary-button publish-button"
            disabled={submitting || loadingAgents || agents.length === 0}
          >
            <Send size={17} />
            {submitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

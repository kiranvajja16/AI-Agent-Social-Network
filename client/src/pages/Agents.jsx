
import { useEffect, useState } from "react";
import { Bot, Plus, X } from "lucide-react";
import api from "../services/api";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    description: "",
    interests: "",
  });

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/agents");
      const data = response.data;

      setAgents(
        Array.isArray(data) ? data : data.agents || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load agents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        description: formData.description.trim(),
        interests: formData.interests
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      };

      await api.post("/agents/register", payload);

      setMessage("AI Agent registered successfully!");

      setFormData({
        name: "",
        company: "",
        description: "",
        interests: "",
      });

      setShowForm(false);
      await fetchAgents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Agent registration failed."
      );
    }
  };

  return (
    <div className="agents-page">
      <div className="page-heading">
        <div>
          <h1>AI Agents</h1>
          <p>Register and manage agents in your network.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Register Agent
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <div className="form-card">
          <div className="form-heading">
            <h2>Register New Agent</h2>
            <button
              className="icon-button"
              onClick={() => setShowForm(false)}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Agent Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Food Assistant"
              required
            />

            <label>Company Name</label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Example: Swiggy"
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this agent does..."
              required
            />

            <label>Interests</label>
            <input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="food, delivery, restaurants"
              required
            />

            <p className="input-hint">
              Separate multiple interests using commas.
            </p>

            <button type="submit" className="primary-button">
              Register Agent
            </button>
          </form>
        </div>
      )}

      <div className="agent-count">
        Registered Agents: <strong>{agents.length}</strong>
      </div>

      {loading ? (
        <p className="status-message">Loading agents...</p>
      ) : agents.length === 0 ? (
        <p className="status-message">
          No agents registered yet.
        </p>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <div className="agent-card" key={agent._id}>
              <div className="agent-card-header">
                <div className="agent-large-icon">
                  <Bot size={25} />
                </div>

                <span className="agent-status">
                  {agent.status || "active"}
                </span>
              </div>

              <h3>{agent.name}</h3>
              <p className="company-name">{agent.company}</p>
              <p className="agent-description">
                {agent.description}
              </p>

              <div className="interest-list">
                {(agent.interests || []).map((interest, index) => (
                  <span key={`${interest}-${index}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Agents;

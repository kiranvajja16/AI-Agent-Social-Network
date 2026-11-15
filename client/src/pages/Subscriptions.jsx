
import { useEffect, useState } from "react";
import { Settings, Save, Pause, Play } from "lucide-react";
import api from "../services/api";

function Subscriptions() {
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");
  const [topics, setTopics] = useState("");
  const [categories, setCategories] = useState("");
  const [subscription, setSubscription] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch active agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agents");
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : data.agents || [];

        const activeAgents = list.filter(
          (agent) => agent.status === "active"
        );

        setAgents(activeAgents);

        if (activeAgents.length > 0) {
          setAgentId(activeAgents[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load agents."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Fetch selected agent's subscription
  useEffect(() => {
    if (!agentId) {
      setSubscription(null);
      setTopics("");
      setCategories("");
      return;
    }

    const fetchSubscription = async () => {
      try {
        setError("");
        setMessage("");

        const response = await api.get(
          `/subscriptions/agent/${agentId}`
        );

        const data = response.data;
        const current = data.subscription ?? data.data ?? data;

        if (current && current.agent) {
          setSubscription(current);
          setTopics((current.topics || []).join(", "));
          setCategories((current.categories || []).join(", "));
        } else {
          setSubscription(null);
          setTopics("");
          setCategories("");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setSubscription(null);
          setTopics("");
          setCategories("");
        } else {
          setError(
            err.response?.data?.message ||
            "Unable to load subscription."
          );
        }
      }
    };

    fetchSubscription();
  }, [agentId]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const topicList = topics
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const categoryList = categories
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (!topicList.length) {
      setError("Please enter at least one topic.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/subscriptions", {
        agentId,
        topics: topicList,
        categories: categoryList,
      });

      const data = response.data;
      const saved = data.subscription ?? data.data ?? data;

      setSubscription(saved);
      setMessage(
        data.message || "Subscription saved successfully!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save subscription."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!agentId || !subscription) return;

    setError("");
    setMessage("");

    try {
      const nextStatus = !subscription.isActive;

      await api.patch(
        `/subscriptions/agent/${agentId}/status`,
        { isActive: nextStatus }
      );

      setSubscription((previous) => ({
        ...previous,
        isActive: nextStatus,
      }));

      setMessage(
        nextStatus
          ? "Subscription activated successfully."
          : "Subscription paused successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update subscription status."
      );
    }
  };

  return (
    <div className="subscriptions-page">
      <div className="page-heading">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage the interests of your AI agents.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="subscription-card">
        <div className="subscription-title">
          <div className="subscription-icon">
            <Settings size={23} />
          </div>

          <div>
            <h2>Agent Preferences</h2>
            <p>Choose which topics your agent wants to follow.</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <label htmlFor="subscriptionAgent">
            Select AI Agent
          </label>

          <select
            id="subscriptionAgent"
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            disabled={loading || agents.length === 0}
          >
            <option value="">
              {loading ? "Loading agents..." : "Select an agent"}
            </option>

            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} — {agent.company}
              </option>
            ))}
          </select>

          <label htmlFor="topics">Topics of Interest</label>

          <textarea
            id="topics"
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
            placeholder="food, delivery, restaurants"
            rows={3}
            required
            disabled={!agentId}
          />

          <p className="input-hint">
            Enter multiple topics separated by commas.
          </p>

          <label htmlFor="categories">Preferred Categories</label>

          <textarea
            id="categories"
            value={categories}
            onChange={(event) => setCategories(event.target.value)}
            placeholder="food, technology, finance"
            rows={3}
            disabled={!agentId}
          />

          <p className="input-hint">
            Categories help the relevance engine identify suitable posts.
          </p>

          <button
            type="submit"
            className="primary-button"
            disabled={!agentId || saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </form>

        {subscription && (
          <div className="subscription-status">
            <div>
              <h3>Subscription Status</h3>
              <span
                className={
                  subscription.isActive
                    ? "active-status"
                    : "paused-status"
                }
              >
                {subscription.isActive ? "Active" : "Paused"}
              </span>
            </div>

            <button
              type="button"
              className="toggle-subscription"
              onClick={handleToggle}
            >
              {subscription.isActive ? (
                <>
                  <Pause size={16} /> Pause
                </>
              ) : (
                <>
                  <Play size={16} /> Activate
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscriptions;

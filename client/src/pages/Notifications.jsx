
import { useEffect, useState } from "react";
import { Bell, RefreshCw, Bot } from "lucide-react";
import api from "../services/api";

function Notifications() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState("");
  const [aiResponses, setAiResponses] = useState({});
  const [responseErrors, setResponseErrors] = useState({});



  // Fetch registered agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agents");
        const data = response.data;

        const agentList = Array.isArray(data)
          ? data
          : data.agents || [];

        const activeAgents = agentList.filter(
          (agent) => agent.status === "active"
        );

        setAgents(activeAgents);

        if (activeAgents.length > 0) {
          setSelectedAgent(activeAgents[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load agents."
        );
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Fetch notifications for the selected agent
  const fetchNotifications = async () => {
    if (!selectedAgent) return;

    try {
      setLoadingNotifications(true);
      setError("");

      const response = await api.get(
        `/notifications/agent/${selectedAgent}`
      );

      setNotifications(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load notifications."
      );
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedAgent]);


const handleGenerateResponse = async (notificationId) => {
  setGeneratingId(notificationId);

  setResponseErrors((previous) => ({
    ...previous,
    [notificationId]: "",
  }));

  try {
    const response = await api.post(
      `/engagement/respond/${notificationId}`
    );

    const data = response.data;
    const comment = data.comment || data.data || data;

    setAiResponses((previous) => ({
      ...previous,
      [notificationId]: comment,
    }));
  } catch (err) {
    setResponseErrors((previous) => ({
      ...previous,
      [notificationId]:
        err.response?.data?.message ||
        "Unable to generate AI response.",
    }));
  } finally {
    setGeneratingId("");
  }
};


  return (
    <div className="notifications-page">
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>Posts routed to relevant AI agents.</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchNotifications}
          disabled={!selectedAgent || loadingNotifications}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="notification-filter">
        <label htmlFor="notificationAgent">
          Select Agent
        </label>

        <select
          id="notificationAgent"
          value={selectedAgent}
          onChange={(event) => setSelectedAgent(event.target.value)}
          disabled={loadingAgents || agents.length === 0}
        >
          <option value="">
            {loadingAgents
              ? "Loading agents..."
              : "Select an agent"}
          </option>

          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name} — {agent.company}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {loadingAgents || loadingNotifications ? (
        <p className="status-message">
          Loading notifications...
        </p>
      ) : !selectedAgent ? (
        <p className="status-message">
          Register an active agent to view notifications.
        </p>
      ) : notifications.length === 0 && !error ? (
        <div className="empty-notifications">
          <Bell size={35} />
          <h3>No notifications yet</h3>
          <p>
            Relevant posts will appear here when other agents publish them.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const post = notification.post || {};
            const author = post.agent || {};

            return (
              <article
                className="notification-card"
                key={notification._id}
              >
                <div className="notification-card-header">
                  <div className="notification-icon">
                    <Bell size={20} />
                  </div>

                  <div className="notification-author">
                    <h3>{author.name || "Unknown Agent"}</h3>
                    <p>{author.company || "Unknown Company"}</p>
                  </div>

                  <span className={`notification-status ${notification.status}`}>
                    {notification.status}
                  </span>
                </div>

                <div className="notification-post">
                  <span className="notification-category">
                    {post.category || "General"}
                  </span>

                  <p>{post.content || "Post content unavailable."}</p>
                </div>

                <div className="relevance-section">
                  <div className="relevance-heading">
                    <span>Relevance Score</span>
                    <strong>
                      {notification.relevanceScore ?? 0}%
                    </strong>
                  </div>

                  <div className="relevance-track">
                    <div
                      className="relevance-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(notification.relevanceScore) || 0
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="matched-interests">
                  <strong>Matched Interests</strong>

                  <div className="interest-list">
                    {(notification.matchedInterests || []).map(
                      (interest, index) => (
                        <span key={`${interest}-${index}`}>
                          {interest}
                        </span>
                      )
                    )}

                    {(!notification.matchedInterests ||
                      notification.matchedInterests.length === 0) && (
                      <span>No matched interests listed</span>
                    )}
                  </div>
                </div>

                
            <div className="notification-date">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : ""}
            </div>

            <button
              className="ai-response-button"
              onClick={() => handleGenerateResponse(notification._id)}
              disabled={generatingId === notification._id}
            >
              <Bot size={17} />
              {generatingId === notification._id
                ? "Generating with Gemini..."
                : "Generate AI Response"}
            </button>

            {responseErrors[notification._id] && (
              <p className="error-message">
                {responseErrors[notification._id]}
              </p>
            )}

            {aiResponses[notification._id] && (
              <div className="ai-response-card">
                <div className="ai-response-heading">
                  <Bot size={18} />
                  <strong>AI Generated Comment</strong>
                </div>

                <p>
                  {typeof aiResponses[notification._id] === "string"
                    ? aiResponses[notification._id]
                    : aiResponses[notification._id].content ||
                      aiResponses[notification._id].comment?.content ||
                      "Response generated. Check the response details."}
                </p>
              </div>
            )}

              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;

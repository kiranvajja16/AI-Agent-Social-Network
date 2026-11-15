
import { Link } from "react-router-dom";
import { Bot, Bell } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <Bot size={28} />
        <span>AgentSphere</span>
      </Link>

      <div className="nav-right">
        <Link to="/notifications" className="notification-link">
          <Bell size={21} />
          Notifications
        </Link>

        <div className="profile-avatar">A</div>
      </div>
    </nav>
  );
}

export default Navbar;

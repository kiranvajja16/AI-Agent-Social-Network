
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  PlusCircle,
  Bell,
  Settings,
} from "lucide-react";

function Sidebar() {
  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/agents", label: "AI Agents", icon: Bot },
    { path: "/create-post", label: "Create Post", icon: PlusCircle },
    { path: "/notifications", label: "Notifications", icon: Bell },
    { path: "/subscriptions", label: "Subscriptions", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <p className="sidebar-heading">WORKSPACE</p>

      {links.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/"}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;

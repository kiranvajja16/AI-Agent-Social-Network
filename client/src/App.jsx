
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import CreatePost from "./pages/CreatePost";
import Notifications from "./pages/Notifications";
import Subscriptions from "./pages/Subscriptions";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <div className="main-layout">
          <Sidebar />

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route
                path="/notifications"
                element={<Notifications />}
              />
              <Route
                path="/subscriptions"
                element={<Subscriptions />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

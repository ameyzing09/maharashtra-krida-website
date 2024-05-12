import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../component/Header";
import PrivateRoute from "../component/PrivateRoute";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import Event from "../pages/Event";
import Login from "../pages/Login";
import EventManagement from "../pages/EventManagement";
import HomepageManagement from "../pages/HomepageManagement";
import Menu from "../pages/Menu";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="upcoming-events" element={<Event />} />
            <Route element={<PrivateRoute />}>
              <Route path="menu" element={<Menu />} />
              <Route
                path="content-management"
                element={<HomepageManagement />}
              />
              <Route path="event-management" element={<EventManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default Router;

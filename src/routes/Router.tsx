import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../component/Header";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import Event from "../pages/Event";
import EventForm from "../component/EventForm";
import PrivateRoute from "../component/PrivateRoute";
import Login from "../pages/Login";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="upcoming-events" element={<Event />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="event-form" element={<EventForm />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default Router;

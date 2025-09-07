import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../component/Header";
import PrivateRoute from "../component/PrivateRoute";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import Event from "../pages/Event";
import GalleryPage from "../pages/Gallery";
import NewsPage from "../pages/News";
import NewsDetail from "../pages/NewsDetail";
import Login from "../pages/Login";
import EventManagement from "../pages/EventManagement";
import HomepageManagement from "../pages/HomepageManagement";
import GalleryManagement from "../pages/GalleryManagement";
import NewsManagement from "../pages/NewsManagement";
import Menu from "../pages/Menu";
import Register from "../pages/Register";
import Success from "../pages/Payment/Success";
import Failure from "../pages/Payment/Failure";
import TournamentsPage from "../pages/Tournaments";
import TournamentAdmin from "../pages/TournamentAdmin";

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
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="menu" element={<Menu />} />
              <Route
                path="/menu/content-management"
                element={<HomepageManagement />}
              />
              <Route path="/menu/event-management" element={<EventManagement />} />
              <Route path="/menu/tournaments" element={<TournamentAdmin />} />
              <Route path="/menu/gallery-management" element={<GalleryManagement />} />
              <Route path="/menu/news-management" element={<NewsManagement />} />
            </Route>
            <Route path="/payment/success" element={<Success />} />
            <Route path="/payment/failure" element={<Failure />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default Router;

import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import PageTransition from "../component/PageTransition";
import TopProgressBar from "../component/TopProgressBar";

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="about" element={<PageTransition><About /></PageTransition>} />
        <Route path="contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="upcoming-events" element={<PageTransition><Event /></PageTransition>} />
        <Route path="gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
        <Route path="news" element={<PageTransition><NewsPage /></PageTransition>} />
        <Route path="news/:id" element={<PageTransition><NewsDetail /></PageTransition>} />
        <Route path="tournaments" element={<PageTransition><TournamentsPage /></PageTransition>} />
        <Route path="register" element={<PageTransition><Register /></PageTransition>} />
        <Route element={<PrivateRoute />}>
          <Route path="menu" element={<PageTransition><Menu /></PageTransition>} />
          <Route path="/menu/content-management" element={<PageTransition><HomepageManagement /></PageTransition>} />
          <Route path="/menu/event-management" element={<PageTransition><EventManagement /></PageTransition>} />
          <Route path="/menu/tournaments" element={<PageTransition><TournamentAdmin /></PageTransition>} />
          <Route path="/menu/gallery-management" element={<PageTransition><GalleryManagement /></PageTransition>} />
          <Route path="/menu/news-management" element={<PageTransition><NewsManagement /></PageTransition>} />
        </Route>
        <Route path="/payment/success" element={<PageTransition><Success /></PageTransition>} />
        <Route path="/payment/failure" element={<PageTransition><Failure /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <TopProgressBar />
        <Header />
        <main>
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
};

export default Router;

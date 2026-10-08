import { Routes, Route, NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

function Layout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Tideline Ceramics</Link>
        <nav aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Tideline Ceramics · 14 Harbor Lane · Open Wed–Sun, 10–5</p>
      </footer>
    </>
  );
}

function NotFound() {
  return (
    <section className="page narrow">
      <h1>Page not found</h1>
      <p>That page doesn’t exist. Head back to the <Link to="/">home page</Link>.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

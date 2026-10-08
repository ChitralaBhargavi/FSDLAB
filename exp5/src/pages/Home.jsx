import { Link } from "react-router-dom";

const classes = [
  { name: "Wheel basics", when: "Thursdays, 6–8 pm", detail: "Center, open and pull a cylinder. Six weeks, clay included." },
  { name: "Hand-building", when: "Saturdays, 10 am–12 pm", detail: "Pinch, coil and slab. A good first class, no experience needed." },
  { name: "Glaze lab", when: "First Sunday monthly", detail: "Test tiles, layering and firing results with our studio glazes." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Handmade bowls, mugs and vases, fired by the harbor.</h1>
        <p>
          Tideline is a working pottery studio. Shop what’s on the shelves or
          learn to throw your own.
        </p>
        <div className="actions">
          <Link className="btn primary" to="/contact">Book a class</Link>
          <Link className="btn" to="/about">Meet the studio</Link>
        </div>
      </section>

      <section className="page">
        <h2>Classes this season</h2>
        <ul className="classes">
          {classes.map((c) => (
            <li key={c.name}>
              <h3>{c.name}</h3>
              <p className="when">{c.when}</p>
              <p>{c.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="page narrow">
      <h1>About the studio</h1>
      <p>
        Tideline opened in 2019 in a former boat shed. Four potters share the
        space, two kilns and a wall of glaze samples that keeps growing.
      </p>
      <p>
        Everything we sell is thrown, trimmed and glazed on site. Our glazes
        lean toward the colors of the water outside: celadon, slate and deep
        cobalt.
      </p>
      <h2>What we make</h2>
      <p>
        Dinnerware sets, single mugs, planters and one-off vases. Pieces are
        dishwasher and microwave safe unless the tag says otherwise.
      </p>
      <p>
        Want something custom? <Link to="/contact">Send us a message</Link>.
      </p>
    </section>
  );
}

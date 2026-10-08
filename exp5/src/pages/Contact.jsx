import { useState } from "react";

const empty = { name: "", email: "", message: "" };

export default function Contact() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.message.trim().length < 10) next.message = "Write at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // Replace with a real request, e.g. fetch("/api/contact", { method: "POST", ... })
      console.log("Contact form:", values);
      setSent(true);
      setValues(empty);
    }
  };

  return (
    <section className="page narrow">
      <h1>Contact</h1>
      <p>Questions about classes, orders or commissions? We reply within two days.</p>

      {sent && (
        <p className="notice" role="status">
          Message sent. We’ll be in touch soon.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate>
        {[
          ["name", "Name", "text"],
          ["email", "Email", "email"],
        ].map(([key, label, type]) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input id={key} name={key} type={type} value={values[key]} onChange={onChange}
              aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-err` : undefined} />
            {errors[key] && <span id={`${key}-err`} className="error">{errors[key]}</span>}
          </div>
        ))}
        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows="5" value={values.message} onChange={onChange}
            aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} />
          {errors.message && <span id="message-err" className="error">{errors.message}</span>}
        </div>
        <button className="btn primary" type="submit">Send message</button>
      </form>
    </section>
  );
}

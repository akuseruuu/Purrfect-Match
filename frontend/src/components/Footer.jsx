import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <h3 className="landing-footer-brand">Purrfect Match</h3>
        <div className="landing-footer-links">
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Services</Link>
          <Link to="/">Contact Us</Link>
        </div>
        <p className="landing-footer-copy">
          © {new Date().getFullYear()} Purrfect Match. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

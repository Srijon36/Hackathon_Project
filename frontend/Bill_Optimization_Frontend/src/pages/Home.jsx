import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-root">

      {/* ── Hero ── */}
      <section className="home-hero-new">
        <div className="hero-badge-new">● PROVEN BILL ANALYSIS SYSTEM</div>

        <h1 className="hero-title-new">

          Optimize Your{" "}
          <span className="hero-title-green">Energy Bill</span>{" "}
          <span className="hero-title-ghost">for Savings</span>

          Optimize Your{" "}
          <span className="hero-title-green">Energy Bill</span>{" "}
          <span className="hero-title-ghost">for Savings</span>

          {t("heroTitle1")}<br />
          <span className="hero-title-green">{t("heroTitle2")}</span>

        </h1>

        <p className="hero-desc">
          Our service <strong>analyzes your bill costs</strong> across thousands of data points
          and 50+ providers to find a good plan for{" "}
          <strong>bill savings and lowering energy costs</strong>.
        </p>

        <Link to="/upload" className="hero-cta-btn">
          Analyze My Bill &nbsp;→
        </Link>

        <p className="hero-fine">NO CREDIT CARD REQUIRED • INSTANT ANALYSIS</p>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <p>© 2026 myEnergy_bill_optimization. All rights reserved.</p>
        <div className="home-footer-links">
          <span>BILL ANALYSIS</span>
          <span>COST OPTIMIZATION</span>
          <span>ENERGY SAVINGS</span>
        </div>
      </footer>

      <style>{`
        /* ── Root ── */
        .home-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #eefaf2 0%, #f5fdf7 50%, #e8f8f0 100%);
          font-family: 'Segoe UI', sans-serif;
        }

        /* ── Hero ── */
        .home-hero-new {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 24px 48px;
          gap: 20px;
        }

        /* ── Badge ── */
        .hero-badge-new {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1.5px solid #b6e8c4;
          color: #2d9e5f;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 16px;
          border-radius: 999px;
          text-transform: uppercase;
        }

        /* ── Title ── */
        .hero-title-new {
          margin: 0;
          font-size: clamp(56px, 9vw, 100px);
          font-weight: 900;
          line-height: 1.15;
          color: #0d2137;
          letter-spacing: -0.02em;
          max-width: 820px;
        }

        .hero-title-green {
          color: #2ecc71;
        }

        .hero-title-ghost {
          color: #0d2137;
        }

        /* ── Description ── */
        .hero-desc {
          max-width: 540px;
          margin: 0;
          font-size: 18px;
          line-height: 1.7;
          color: #4a6070;
        }

        .hero-desc strong {
          color: #0d2137;
        }

        /* ── CTA Button ── */
        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          background: #2ecc71;
          color: #ffffff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 15px 36px;
          border-radius: 8px;
          transition: background 0.2s ease, transform 0.15s ease;
        }

        .hero-cta-btn:hover {
          background: #27b863;
          transform: translateY(-1px);
        }

        /* ── Fine print ── */
        .hero-fine {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #8aacb8;
          text-transform: uppercase;
        }

        /* ── Footer ── */
        .home-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 24px;
          border-top: 1px solid #d4edd9;
          text-align: center;
        }

        .home-footer p {
          margin: 0;
          font-size: 12px;
          color: #8aacb8;
        }

        .home-footer-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .home-footer-links span {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #2d9e5f;
          text-transform: uppercase;
        }
      `}</style>

    </div>
  );
};

export default Home;
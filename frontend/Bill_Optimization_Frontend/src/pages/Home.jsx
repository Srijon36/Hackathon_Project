import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-root">

      {/* ── Hero ── */}
      <section className="home-hero-new">
        <div className="hero-badge-new">● PROVEN BILL ANALYSIS SYSTEM</div>

        <h1 className="hero-title-new">
          Optimize Your<br />
          <span className="hero-title-green">Energy Bill</span><br />
          <span className="hero-title-ghost">for Savings</span>
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

    </div>
  );
};

export default Home;
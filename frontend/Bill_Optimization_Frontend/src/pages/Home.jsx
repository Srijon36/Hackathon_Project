import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <div className="home-hero">
        <div className="hero-badge">🇮🇳 Made for Indian households</div>
        <h1 className="hero-title">
          Cut Your Electricity<br /><span>Bill in Half</span>
        </h1>
        <p className="hero-sub">
          Upload your bill, get AI-powered insights, compare tariffs,
          and start saving money in under 30 seconds.
        </p>
        <div className="hero-btns">
          <Link to="/login" className="btn-white">⚡ Get Started Free</Link>
          <Link to="/upload" className="btn-outline-white">Upload Bill →</Link>
        </div>
      </div>

      <div className="home-stats-section">
        <div className="home-stats-row">
          <div className="h-stat">
            <span className="h-stat-val">₹4,200</span>
            <div className="h-stat-label">Avg. Annual Savings</div>
          </div>
          <div className="h-stat">
            <span className="h-stat-val">30s</span>
            <div className="h-stat-label">Time to Insights</div>
          </div>
          <div className="h-stat">
            <span className="h-stat-val">12k+</span>
            <div className="h-stat-label">Bills Analysed</div>
          </div>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <div className="feature-title">Upload Any Bill</div>
            <div className="feature-desc">Supports PDF, JPG, PNG. Works with all Indian electricity providers.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">AI Analysis</div>
            <div className="feature-desc">Our AI reads your bill, detects anomalies and compares with your usage history.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <div className="feature-title">Start Saving</div>
            <div className="feature-desc">Get personalised tips and tariff comparisons to reduce your monthly bill.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
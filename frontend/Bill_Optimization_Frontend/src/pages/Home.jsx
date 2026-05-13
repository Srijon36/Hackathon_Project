import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="home-root">

      {/* ── Hero ── */}
      <section className="home-hero-new">
        <div className="hero-badge-new">{t("heroBadge")}</div>

        <h1 className="hero-title-new">
          {t("heroTitle1")}<br />
          <span className="hero-title-green">{t("heroTitle2")}</span>
        </h1>

        <p className="hero-desc">
          {t("heroSub")}
        </p>

        <Link to="/upload" className="hero-cta-btn">
          {t("uploadBillBtn")}
        </Link>

        <p className="hero-fine">NO CREDIT CARD REQUIRED • INSTANT ANALYSIS</p>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <p>© 2026 myEnergy_bill_optimization. All rights reserved.</p>
        <div className="home-footer-links">
          <span>{t("feature1Title")}</span>
          <span>{t("feature2Title")}</span>
          <span>{t("feature3Title")}</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
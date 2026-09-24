import BenefitsSection from "./components/BenefitsSection";
import CTASection from "./components/CTASection";
import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import "./Home.css";

export default function HomePage() {
    return (
        <main className="pagina-inicial">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <BenefitsSection />
            <CTASection />
        </main>
    );
}

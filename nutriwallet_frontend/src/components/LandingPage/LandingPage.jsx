
import Navbar from './Navbar';
import Hero from './Hero';
import Problem from './Problem';
import HowItWorks from './HowItWorks';
import Features from './Features';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="text-gray-900 bg-white selection:bg-green-500 selection:text-white" style={{ fontFamily: '"Geist", sans-serif' }}>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
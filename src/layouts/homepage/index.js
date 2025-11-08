// src/layouts/homepage/index.js

import React from "react";
import HomepageLayout from "layouts/homepage/HomepageLayout";
import HeroSection from "layouts/homepage/components/HeroSection";
import PlayersSection from "layouts/homepage/components/PlayersSection";
import OwnersSection from "layouts/homepage/components/OwnersSection";
import TestimonialsSection from "layouts/homepage/components/TestimonialsSection";
import ContactSection from "layouts/homepage/components/ContactSection";

function Homepage() {
  return (
    <HomepageLayout>
      <HeroSection />
      <PlayersSection />
      <OwnersSection />
      <TestimonialsSection />
      <ContactSection />
    </HomepageLayout>
  );
}

export default Homepage;

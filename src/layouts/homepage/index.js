// src/layouts/homepage/index.js

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import HomepageLayout from "layouts/homepage/HomepageLayout";
import HeroSection from "layouts/homepage/components/HeroSection";
import PlayersSection from "layouts/homepage/components/PlayersSection";
import OwnersSection from "layouts/homepage/components/OwnersSection";
import TestimonialsSection from "layouts/homepage/components/TestimonialsSection";
import ContactSection from "layouts/homepage/components/ContactSection";

function Homepage() {
  const { currentUser, userProfile, emailVerified, initialAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Redirigir usuarios autenticados según su rol
  useEffect(() => {
    if (initialAuthLoading) return;

    if (currentUser) {
      const isSocialAuth = currentUser.providerData?.some(
        (provider) => provider.providerId === "google.com" || provider.providerId === "facebook.com"
      );
      const isEmailVerified = currentUser.emailVerified || emailVerified;

      // Solo redirigir si el email está verificado (o es autenticación social) Y tenemos el perfil
      if ((isEmailVerified || isSocialAuth) && userProfile) {
        if (userProfile.role === "cliente") {
          navigate("/canchas", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    }
  }, [currentUser, userProfile, emailVerified, initialAuthLoading, navigate]);

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

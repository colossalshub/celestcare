"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { LoadingState } from "@/components/states/LoadingState";
import { useApp } from "@/components/providers/AppProvider";

export default function OnboardingPage() {
  const { ready } = useApp();
  if (!ready) return <LoadingState />;
  return <OnboardingWizard />;
}

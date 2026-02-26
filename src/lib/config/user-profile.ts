export const userProfile = {
  name: "Mara",
  age: 30,
  heightInches: 69, // 5'9"
  currentWeight: {
    lbs: 121.2,
    date: "2026-02-25",
  },
  bodyComposition: {
    bodyFatPercent: 28.3,
    fatMassLbs: 34.3,
    leanMassLbs: 82.1,
    bmrKcal: 1369,
  },
  previousScan: {
    date: "2025-10-31",
    weightLbs: 124.0,
    bodyFatPercent: 28.0,
    leanMassLbs: 84.3,
  },
  scanDelta: {
    weightChangeLbs: -2.8,
    leanMassChangeLbs: -2.2,
    fatMassChangeLbs: -0.4,
    interpretation:
      "Majority of weight loss came from lean mass. Primary goal is reversing this trend with muscle gain.",
  },
  weddingDate: "2026-06-06",
  goal: "Bridal muscle recomposition: gain 3-5 lbs (mostly lean mass) over 14 weeks leading to wedding on June 6",
  targetWeight: { min: 124, max: 126 },
  metabolicTargets: {
    estimatedTdee: { min: 1900, max: 2100 },
    targetCalories: { min: 2200, max: 2300 },
    targetProteinGrams: { min: 95, max: 110 },
    strengthSessionsPerWeek: 3,
    zone2SessionsPerWeek: 2,
  },
  constraints: [
    "Avoid caloric deficit",
    "Avoid excessive HIIT",
    "Avoid overtraining",
    "Prioritize recovery",
  ],
  expectedOutcomes: {
    weightGainLbs: "3-5",
    leanMassGainLbs: "2-4",
    visualChanges: [
      "Improved glute fullness",
      "Improved shoulder and arm definition",
      "Waist visually maintained or tighter",
      "Improved posture",
      "Increased BMR",
    ],
  },
  monitoringFlags: [
    "Lean mass decline (from body comp data)",
    "Under-eating: calories below 1800 for 2+ days",
    "Excessive cardio: high strain on rest days (strain > 15)",
    "Poor recovery trend: below 33% for 3+ consecutive days",
    "Hormonal disruption signs: sleep quality decline + recovery decline together",
  ],
  wearables: ["Whoop", "Apple Health"],
} as const;

import type { RoutineType, BeautyRoutine, Procedure, BeautyDayResult } from "@/types";

// --- Skin Profile ---

export const skinProfile = {
  type: "dry" as const,
  concerns: ["puffiness", "tired/dull look", "blackheads nose/chin"],
  preferences: {
    nightRetinoidPerWeek: 2,
    bhaPerWeek: 1,
    metacinePlasmaPreference: "night",
    moisturizerPreference: "Rodial Hydrating Cream",
  },
  rules: [
    "Do not combine retinoid + BHA same night.",
    "If irritation occurs, drop BHA first.",
    "If dryness persists, reduce retinoid to 1x/week.",
    "Avoid introducing new actives close to procedures.",
    "Keep routine calm and consistent.",
  ],
};

// --- Products ---

export const products = {
  cleanser: "iS Clinical Cleansing Complex",
  amAntioxidant: "SkinCeuticals C E Ferulic",
  hydrationSerum: "Biologique Recherche Amniotique VG",
  pmSerum: "Dr. Diamond's Metacine InstaFacial Plasma",
  retinoid: "Retinoid (current)",
  bha: "BHA liquid (nose + chin only)",
  moisturizer: "Rodial Hydrating Cream",
  sunscreen: "EltaMD SPF",
};

// --- Routines ---

export const routines: Record<RoutineType, BeautyRoutine> = {
  morning_default: {
    name: "morning_default",
    label: "Morning Routine",
    steps: [
      `Cleanse (${products.cleanser})`,
      `Vitamin C (${products.amAntioxidant})`,
      products.hydrationSerum,
      "Light moisturizer if needed",
      products.sunscreen,
    ],
  },
  night_metacine: {
    name: "night_metacine",
    label: "Evening — Metacine Plasma",
    steps: [
      `Cleanse (${products.cleanser})`,
      products.hydrationSerum,
      products.pmSerum,
      products.moisturizer,
    ],
  },
  night_retinoid: {
    name: "night_retinoid",
    label: "Evening — Retinoid",
    steps: [
      `Cleanse (${products.cleanser})`,
      `${products.hydrationSerum} (buffer)`,
      `${products.retinoid} (pea-size)`,
      products.moisturizer,
    ],
  },
  night_bha: {
    name: "night_bha",
    label: "Evening — BHA Exfoliant",
    steps: [
      `Cleanse (${products.cleanser})`,
      `${products.hydrationSerum} (light layer)`,
      `${products.bha}`,
      products.moisturizer,
    ],
  },
  night_hydration_only: {
    name: "night_hydration_only",
    label: "Evening — Hydration Only",
    steps: [
      `Cleanse (${products.cleanser})`,
      products.hydrationSerum,
      products.moisturizer,
    ],
  },
  postcare: {
    name: "postcare",
    label: "Evening — Post-Procedure Care",
    steps: [
      `Cleanse (${products.cleanser})`,
      products.hydrationSerum,
      products.moisturizer,
      `${products.sunscreen} (AM)`,
    ],
  },
};

// --- Procedures Calendar ---

export const procedures: Procedure[] = [
  {
    type: "facial",
    date: "2026-03-18",
    label: "Light Enzyme Facial + Dermaplaning",
    details: ["Light enzyme", "Light dermaplaning (gentle)"],
  },
  {
    type: "aquagold",
    date: "2026-03-21",
    label: "Aquagold",
    preCare: { stopRetinoidDaysBefore: 4, stopBhaDaysBefore: 4 },
    postCare: {
      daysAfter: 3,
      steps: routines.postcare.steps,
    },
  },
  {
    type: "event",
    date: "2026-03-27",
    label: "Pre-Ceremony Event",
  },
  {
    type: "laser",
    date: "2026-04-03",
    label: "Moxi Laser",
    preCare: { stopRetinoidDaysBefore: 7, stopBhaDaysBefore: 7 },
    postCare: {
      daysAfter: 7,
      steps: routines.postcare.steps,
    },
  },
  {
    type: "botox",
    date: "2026-04-14",
    label: "Botox",
  },
  {
    type: "event",
    date: "2026-06-06",
    label: "Wedding Day",
  },
];

// --- Weekly Evening Template ---

const weeklyEveningSchedule: Record<string, RoutineType> = {
  monday: "night_retinoid",
  tuesday: "night_metacine",
  wednesday: "night_bha",
  thursday: "night_retinoid",
  friday: "night_metacine",
  saturday: "night_metacine",
  sunday: "night_hydration_only",
};

// --- Core Function ---

function diffDays(from: Date, to: Date): number {
  const msPerDay = 86400000;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

export function getTodayBeautyRoutine(date: Date): BeautyDayResult {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[date.getDay()];
  const dateStr = date.toISOString().split("T")[0];

  // Start with default routines
  const morningRoutine = routines.morning_default;
  let eveningRoutineName: RoutineType = weeklyEveningSchedule[dayName] ?? "night_hydration_only";
  const specialNotes: string[] = [];
  const upcomingProcedures: BeautyDayResult["upcomingProcedures"] = [];
  const activePostCare: BeautyDayResult["activePostCare"] = [];

  // Check each procedure for pre/post-care
  for (const proc of procedures) {
    const procDate = new Date(proc.date + "T00:00:00");
    const daysUntil = diffDays(date, procDate);
    const daysSince = -daysUntil;

    // Track upcoming procedures within 14 days
    if (daysUntil > 0 && daysUntil <= 14) {
      upcomingProcedures.push({ procedure: proc, daysUntil });
    }

    // Post-care: procedure was today or recent (takes priority)
    if (proc.postCare && daysSince >= 0 && daysSince <= proc.postCare.daysAfter) {
      activePostCare.push({ procedure: proc, daysSince });
      eveningRoutineName = "postcare";
      if (daysSince === 0) {
        specialNotes.push(`${proc.label} today — gentle postcare routine tonight. No actives.`);
      } else {
        specialNotes.push(
          `Post-${proc.label} day ${daysSince}/${proc.postCare.daysAfter} — continue postcare routine. No actives.`
        );
      }
    }

    // Pre-care: only if no post-care is already active
    if (proc.preCare && daysUntil > 0 && activePostCare.length === 0) {
      const isRetinoidNight = eveningRoutineName === "night_retinoid";
      const isBhaNight = eveningRoutineName === "night_bha";

      if (isRetinoidNight && daysUntil <= proc.preCare.stopRetinoidDaysBefore) {
        eveningRoutineName = "night_metacine";
        specialNotes.push(
          `${proc.label} in ${daysUntil} days — skipping retinoid tonight (pre-care). Switching to Metacine.`
        );
      }
      if (isBhaNight && daysUntil <= proc.preCare.stopBhaDaysBefore) {
        eveningRoutineName = "night_metacine";
        specialNotes.push(
          `${proc.label} in ${daysUntil} days — skipping BHA tonight (pre-care). Switching to Metacine.`
        );
      }
    }
  }

  return {
    date: dateStr,
    morningRoutine,
    eveningRoutine: routines[eveningRoutineName],
    specialNotes,
    upcomingProcedures,
    activePostCare,
  };
}

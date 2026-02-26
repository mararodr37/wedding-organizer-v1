import type { WeeklySchedule } from "@/types";

export const weeklySchedule: WeeklySchedule = {
  monday: {
    type: "strength",
    focus: "Upper body strength",
    session: "Upper body strength session",
    exercises: [
      "Dumbbell Shoulder Press (3x8-10)",
      "Lat Pulldown (3x8-10)",
      "Seated Row (3x10)",
      "Lateral Raises (3x12)",
      "Core Circuit: dead bugs + side plank (3 rounds)",
    ],
    guidelines: ["Optional 10 min incline walk post-session"],
  },
  tuesday: {
    type: "flexibility",
    focus: "Core + mobility",
    session: "Pilates or low-impact sculpt",
    guidelines: [
      "Core engagement",
      "Posture work",
      "Avoid high-intensity metabolic circuits",
    ],
  },
  wednesday: {
    type: "strength",
    focus: "Lower body heavy",
    session: "Personal training - Lower body heavy",
    exercises: [
      "Hip Thrust (progressive overload)",
      "Romanian Deadlift",
      "Split Squats",
      "Cable Glute Work",
    ],
    guidelines: ["No cardio post-session"],
  },
  thursday: {
    type: "cardio",
    focus: "Zone 2 walk",
    session: "Zone 2 walk (30-45 min, HR 145-150)",
    guidelines: ["Recovery and metabolic support", "Heart rate target 145-150"],
  },
  friday: {
    type: "rest",
    focus: "Recovery",
    session: "Rest or light sculpt",
    conditional: {
      if_fatigued: "Full rest day",
      if_energized: "30 min mat Pilates",
    },
  },
  saturday: {
    type: "strength",
    focus: "Lower body + accessory upper",
    session: "Personal training - Lower body + upper accessory",
    exercises: [
      "Squat or Leg Press",
      "Hamstring Work",
      "Glute Variations",
      "Upper Pull Accessory",
    ],
  },
  sunday: {
    type: "cardio",
    focus: "Recovery flow",
    session: "Long walk or recovery flow (45-60 min)",
    guidelines: ["Outdoor walk or gentle yoga"],
  },
};

export function getTodaySchedule(date: Date) {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = days[date.getDay()];
  return { dayName, ...weeklySchedule[dayName] };
}

export function getWeekNumber(date: Date, programStartDate: string): number {
  const start = new Date(programStartDate);
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil((diffDays + 1) / 7));
}

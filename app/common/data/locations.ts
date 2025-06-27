export const LOCATIONS = [
  "Bangkok",
  "ChiangMai", 
  "HuaHin",
  "Phuket",
  "Pattaya",
  "Koh Phangan",
  "Koh Tao",
  "Koh Samui",
  "All Cities"
] as const;

export type Location = typeof LOCATIONS[number]; 
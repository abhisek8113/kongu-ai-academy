import data from "./courseLabs.json";

export type CourseLab = {
  course: string; courseName: string; color: string; folder: string; lab: string; num: number;
  title: string; track: string; level: string; time: string; goals: string[];
  notebook: string; datasets: string[]; base: string; colab: string;
};

export const courseLabs = data as CourseLab[];

export const courses = Array.from(new Map(courseLabs.map((l) => [l.course, l])).values()).map((l) => ({
  slug: l.course,
  name: l.courseName,
  color: l.color,
  labs: courseLabs.filter((x) => x.course === l.course).sort((a, b) => a.num - b.num),
}));

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);

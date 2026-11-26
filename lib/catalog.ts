import { courses } from "@/lib/courseLabs";
import { getTrack } from "@/lib/labs";

const mins = (t: string) => {
  const m = t.match(/(\d+)\s*min/); const h = t.match(/(\d+(?:\.\d+)?)\s*h/);
  return m ? Number(m[1]) : h ? Number(h[1]) * 60 : 0;
};
const hrs = (n: number) => `${Math.round(n / 60)} hours`;

export type Course = {
  name: string; status: "Self-paced + instructor-led" | "Instructor-led" | "Planned";
  description: string; skills: string[]; level: string; duration: string;
  outcomes: string[]; projects: string[]; href?: string; labs?: number;
};

const c1 = courses.find((c) => c.slug === "python-data-foundations")!;
const c2 = courses.find((c) => c.slug === "classical-ml")!;
const t = (s: string) => getTrack(s)!;
const trackHours = (s: string) => `${t(s).labs.reduce((n, l) => n + l.hours, 0)} hours`;

export const catalog: Course[] = [
  {
    name: "Python & Data Foundations", status: "Self-paced + instructor-led", href: "/courses/python-data-foundations", labs: c1.labs.length,
    description: "From Python basics to cleaning, analysing and visualising real datasets, with statistics and SQL along the way.",
    skills: ["Python", "pandas", "Statistics", "SQL", "Visualisation"], level: "Beginner → Intermediate",
    duration: hrs(c1.labs.reduce((n, l) => n + mins(l.time), 0)),
    outcomes: ["Write clean Python for data work", "Run an A/B test correctly", "Turn messy data into clear charts"],
    projects: ["Retail data cleanup", "SMS spam classifier", "HR attrition capstone"],
  },
  {
    name: "Classical Machine Learning", status: "Self-paced + instructor-led", href: "/courses/classical-ml", labs: c2.labs.length,
    description: "Regression, classification, clustering and model selection with scikit-learn, ending in a documented capstone model.",
    skills: ["scikit-learn", "Regression", "Classification", "Clustering", "Model evaluation"], level: "Intermediate",
    duration: hrs(c2.labs.reduce((n, l) => n + mins(l.time), 0)),
    outcomes: ["Choose and tune the right model", "Evaluate with cross-validation", "Explain a model with a model card"],
    projects: ["House price prediction", "Credit risk scoring", "Churn model + model card"],
  },
  {
    name: "Artificial Intelligence", status: "Instructor-led", href: "/labs/ai-labs", labs: t("ai-labs").labs.length,
    description: "Practical AI: computer vision with pretrained models, responsible AI and evaluation, alongside LLM fundamentals.",
    skills: ["Computer vision", "Transfer learning", "Responsible AI", "Evaluation"], level: "Beginner → Advanced",
    duration: trackHours("ai-labs"),
    outcomes: ["Use pretrained models", "Evaluate AI outputs for bias", "Write a model card"],
    projects: ["Image classifier demo", "Model card for an AI app"],
  },
  {
    name: "Generative AI", status: "Instructor-led", href: "/labs/ai-labs",
    description: "Prompt engineering, LLM APIs, retrieval-augmented generation and AI agents, built as working apps.",
    skills: ["Prompting", "LLM APIs", "RAG", "AI agents", "Gradio"], level: "Beginner → Advanced",
    duration: `${t("ai-labs").labs.slice(0, 4).reduce((n, l) => n + l.hours, 0)} hours`,
    outcomes: ["Build a chatbot", "Answer questions from your PDFs", "Give an agent tools"],
    projects: ["Chat-with-your-PDFs (RAG)", "Analytics agent over a CSV"],
  },
  {
    name: "Data Science", status: "Instructor-led", href: "/labs/ml-labs", labs: t("ml-labs").labs.length,
    description: "The end-to-end workflow: EDA, statistics, ML, deep learning and deploying a model as a web app.",
    skills: ["EDA", "Hypothesis testing", "ML", "Deep learning", "Streamlit"], level: "Beginner → Advanced",
    duration: trackHours("ml-labs"),
    outcomes: ["Run a full analysis", "Train and compare models", "Deploy a live ML app"],
    projects: ["Dropout classifier", "Deployed ML app"],
  },
  {
    name: "Power BI", status: "Instructor-led", href: "/labs/power-bi", labs: t("power-bi").labs.length,
    description: "Power Query, star-schema modelling, DAX and dashboards that managers actually use, published with security.",
    skills: ["Power Query", "Data modelling", "DAX", "Dashboards", "RLS"], level: "Beginner → Intermediate",
    duration: trackHours("power-bi"),
    outcomes: ["Build a refreshable model", "Write core DAX measures", "Publish a secure report"],
    projects: ["Sales performance dashboard"],
  },
  {
    name: "Power Apps", status: "Instructor-led", href: "/labs/power-apps", labs: t("power-apps").labs.length,
    description: "Low-code business apps on Microsoft Power Platform, from canvas apps to Dataverse.",
    skills: ["Canvas apps", "Power Fx", "Dataverse", "Mobile apps"], level: "Beginner → Intermediate",
    duration: trackHours("power-apps"),
    outcomes: ["Ship a working app from a list", "Validate data entry", "Model data in Dataverse"],
    projects: ["College attendance app", "Student enrolment app"],
  },
  {
    name: "Power Automate", status: "Instructor-led", href: "/labs/power-automate", labs: t("power-automate").labs.length,
    description: "Workflow automation: approvals, scheduled reports, AI Builder document extraction and desktop RPA.",
    skills: ["Cloud flows", "Approvals", "AI Builder", "Desktop flows"], level: "Beginner → Advanced",
    duration: trackHours("power-automate"),
    outcomes: ["Automate a form-to-email flow", "Route approvals", "Extract invoice data automatically"],
    projects: ["Leave approval workflow", "Invoice extraction flow"],
  },
];

export const planned = ["Deep Learning", "Agentic AI", "MLOps"];

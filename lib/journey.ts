export type Stage = {
  key: string; name: string; short: string; body: string; skills: string[];
  project: { title: string; href: string; note?: string };
};

// Each example project links to a real lab in the portal.
export const stages: Stage[] = [
  {
    key: "python", name: "Python", short: "Write real code",
    body: "Variables, loops, functions and data structures, written in Colab from day one on real files.",
    skills: ["Lists & dicts", "Functions", "File I/O", "pandas basics"],
    project: { title: "Python Refresher for Data People", href: "/courses/python-data-foundations/lab-01-python-refresher-for-data-people" },
  },
  {
    key: "stats", name: "Statistics", short: "Reason with data",
    body: "Distributions, sampling and hypothesis tests — the maths that tells you whether a result is real.",
    skills: ["Descriptive stats", "t-tests", "Confidence intervals", "A/B testing"],
    project: { title: "A/B Test Analysis — Old vs New Page", href: "/courses/python-data-foundations/lab-05-ab-test-analysis" },
  },
  {
    key: "analysis", name: "Data Analysis", short: "Clean, explore, explain",
    body: "Clean messy data, explore it visually and turn findings into charts a manager can act on.",
    skills: ["Data cleaning", "EDA", "Visualisation", "SQL"],
    project: { title: "Messy Retail Cleanup Pipeline", href: "/courses/python-data-foundations/lab-03-messy-retail-cleanup" },
  },
  {
    key: "ml", name: "Machine Learning", short: "Predict and classify",
    body: "Regression, classification and clustering with scikit-learn, evaluated properly with cross-validation.",
    skills: ["Regression", "Classification", "Clustering", "Model evaluation"],
    project: { title: "Customer churn model with a model card", href: "/courses/classical-ml/lab-13-capstone-churn-model-card" },
  },
  {
    key: "dl", name: "Deep Learning", short: "Neural networks",
    body: "Build and train neural networks, read learning curves and avoid overfitting.",
    skills: ["Neural nets", "Activation & loss", "Regularisation", "MNIST"],
    project: { title: "Neural Net on MNIST", href: "/courses/classical-ml/lab-07-neural-net-mnist" },
  },
  {
    key: "genai", name: "Generative AI", short: "Build with LLMs",
    body: "Prompting, retrieval-augmented generation and agents — taught as an instructor-led lab track.",
    skills: ["Prompt engineering", "LLM APIs", "RAG", "AI agents"],
    project: { title: "RAG: chat with your PDFs", href: "/labs/ai-labs/ai-03", note: "Instructor-led track" },
  },
];

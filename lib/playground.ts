export type Exercise = { id: string; title: string; task: string; starter: string; expected: string; hint?: string };

export const pythonExercises: Exercise[] = [
  { id: "py-1", title: "Hello, data", task: "Print the sum, mean and maximum of the list `sales`.",
    starter: "sales = [120, 340, 95, 410, 260]\n\n# print the total, the mean and the max\n",
    expected: "1225\n245.0\n410", hint: "Use sum(), len() and max()." },
  { id: "py-2", title: "Count words", task: "Count how often each word appears and print the 3 most common as (word, count).",
    starter: "from collections import Counter\ntext = \"the model learns the data and the data teaches the model\"\n\n",
    expected: "('the', 4)\n('model', 2)\n('data', 2)", hint: "Counter(text.split()).most_common(3)" },
  { id: "py-3", title: "pandas: group and summarise", task: "Load the table into pandas and print the average marks per department, rounded to 1 decimal.",
    starter: "import pandas as pd\ndf = pd.DataFrame({\n    'dept': ['CSE','ECE','CSE','MECH','ECE','CSE'],\n    'marks': [82, 74, 91, 66, 88, 77],\n})\n\n",
    expected: "dept\nCSE     83.3\nECE     81.0\nMECH    66.0\nName: marks, dtype: float64", hint: "df.groupby('dept')['marks'].mean().round(1)" },
  { id: "py-4", title: "NumPy: standardise a column", task: "Standardise x to mean 0 and standard deviation 1, then print the result rounded to 2 decimals.",
    starter: "import numpy as np\nx = np.array([2, 4, 4, 4, 5, 5, 7, 9])\n\n",
    expected: "[-1.5 -0.5 -0.5 -0.5  0.   0.   1.   2. ]", hint: "(x - x.mean()) / x.std()" },
  { id: "py-5", title: "Your first model", task: "Fit a linear regression of salary on years of experience and print the predicted salary for 6 years, rounded to the nearest whole number.",
    starter: "import numpy as np\nfrom sklearn.linear_model import LinearRegression\nyears = np.array([[1],[2],[3],[4],[5]])\nsalary = np.array([30000, 35000, 41000, 46000, 50000])\n\n",
    expected: "55700", hint: "LinearRegression().fit(years, salary).predict([[6]])" },
];

export const sqlExercises: Exercise[] = [
  { id: "sql-1", title: "Explore a table", task: "List the first 5 artists by ArtistId.", starter: "SELECT ArtistId, Name\nFROM Artist\nORDER BY ArtistId\nLIMIT 5;",
    expected: "5 rows: AC/DC, Accept, Aerosmith, Alanis Morissette, Alice In Chains" },
  { id: "sql-2", title: "Filter and sort", task: "Find the 5 longest tracks (Name, Milliseconds), longest first.", starter: "SELECT Name, Milliseconds\nFROM Track\n-- order and limit here\n",
    expected: "5 rows, starting with 'Occupation / Precipice'", hint: "ORDER BY Milliseconds DESC LIMIT 5" },
  { id: "sql-3", title: "Aggregate", task: "Count invoices and total sales per country; show the top 5 countries by sales.", starter: "SELECT BillingCountry, COUNT(*) AS invoices, ROUND(SUM(Total), 2) AS sales\nFROM Invoice\n",
    expected: "USA first, with 91 invoices and 523.06 in sales", hint: "GROUP BY BillingCountry ORDER BY sales DESC LIMIT 5" },
  { id: "sql-4", title: "Join tables", task: "List each genre with its number of tracks, most tracks first.", starter: "SELECT g.Name AS genre, COUNT(t.TrackId) AS tracks\nFROM Genre g\nJOIN Track t ON t.GenreId = g.GenreId\n",
    expected: "Rock first, with 1297 tracks", hint: "GROUP BY g.Name ORDER BY tracks DESC" },
];

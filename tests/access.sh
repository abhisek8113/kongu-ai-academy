#!/usr/bin/env bash
# Anonymous access tests: only the public demo lab may open without login.
BASE=${1:-https://kongu-ai-academy.vercel.app}
fail=0
check() { code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$1"); loc=$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE$1");
  if [[ "$code" == "$2"* ]]; then echo "PASS $1 -> $code $loc"; else echo "FAIL $1 -> $code $loc (want $2)"; fail=1; fi; }
check /playground/python 200
check /playground/sql 307
check /courses/python-data-foundations/lab-01-python-refresher-for-data-people 307
check /courses/classical-ml/lab-04-knn-iris 307
check /labs/ai-labs/ai-01 307
check /course-labs/course-01-foundations-python-math-data/lab-09-chinook-sqlite/chinook.sqlite 401
check /course-labs/course-01-foundations-python-math-data/lab-01-python-refresher-for-data-people/index.html 307
check /dashboard 307
check /admin 307
check /admin/subscriptions 307
check /account/subscription 307
check /pricing 200
check /courses 200
exit $fail

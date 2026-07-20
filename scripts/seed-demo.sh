#!/usr/bin/env bash
# Seed a demo account + sample data into the LOCAL dev server for testing.
#
# The local dev server uses a file-based DuckDB (.data/control.duckdb) with NO
# setup required — DATABASE_URL just needs to be unset. Start the server, then
# run this to create a demo account you can log into.
#
#   Terminal 1:  npm run dev
#   Terminal 2:  ./scripts/seed-demo.sh
#   Browser:     http://localhost:4321/login   →   demo@example.com / demopass123
#
# Usage: ./scripts/seed-demo.sh [base_url]   (default http://localhost:4321)
set -euo pipefail

BASE="${1:-http://localhost:4321}"
EMAIL="demo@example.com"
PASS="demopass123"

jq_get() { python3 -c "import sys,json;print(json.load(sys.stdin).get('$1',''))" 2>/dev/null || true; }

echo "Seeding demo data into $BASE ..."
SIGNUP=$(curl -s -X POST "$BASE/api/auth/signup" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
KEY=$(printf '%s' "$SIGNUP" | jq_get apiKey)

if [ -z "$KEY" ]; then
  echo "No API key returned. Response was:"
  echo "  $SIGNUP"
  echo "If it says email_taken, the demo account already exists — just log in with:"
  echo "  $EMAIL / $PASS"
  exit 0
fi

H=(-H "Authorization: Bearer $KEY" -H "content-type: application/json")

# --- analytics reports + a folder ---
curl -s "${H[@]}" -X POST "$BASE/api/folders" -d '{"name":"Demo Client"}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/reports" -d '{"title":"Q3 revenue review","content":"# Q3 revenue review\n\n**Bottom line:** revenue grew 18% QoQ, driven by returning customers.\n\n- Returning customers drove 72% of revenue.\n- Forecast: +12% next quarter (moderate trust)."}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/reports" -d '{"title":"Churn drivers","content":"# Churn drivers\n\nPast-due payment status is the biggest churn signal (4.1x risk)."}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/reports" -d '{"title":"Customer segments (RFM)","content":"# RFM segments\n\nChampions 12% · Loyal 21% · At Risk 18% · Hibernating 29%."}' >/dev/null

# --- outreach: prompts + prospects (sending is done by the agent's own email tool) ---
curl -s "${H[@]}" -X POST "$BASE/api/outreach/prompts" -d '{"name":"Warm intro","body":"Open with one specific line about the prospect. Keep the pitch to three sentences. Capability-led, no hype. Sign off with first name."}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/outreach/prompts" -d '{"name":"Free data audit","body":"Lead with a concrete data question their product raises. Offer a free teardown. Two sentences."}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/outreach/prospects" -d '{"prospects":[
  {"name":"Jane Doe","email":"jane@acme.example","company":"Acme Co","status":"replied","research":"Sample prospect.","draft_subject":"Hello","draft_body":"Hi Jane, ..."},
  {"name":"John Smith","email":"john@globex.example","company":"Globex","status":"sent","draft_subject":"Hello","draft_body":"Hi John, ..."},
  {"name":"Sam Rivera","email":"sam@initech.example","company":"Initech","status":"drafted","draft_subject":"A quick idea","draft_body":"Hi Sam, ..."},
  {"name":"Priya Nair","email":"priya@umbrella.example","company":"Umbrella","status":"drafted","draft_subject":"Your store data","draft_body":"Hi Priya, ..."},
  {"name":"Alex Kim","email":"alex@hooli.example","company":"Hooli","status":"new","draft_subject":"","draft_body":""}
]}' >/dev/null

echo "Done."
echo "Log in at $BASE/login  →  $EMAIL / $PASS"

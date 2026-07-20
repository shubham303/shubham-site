#!/usr/bin/env bash
# Seed a demo account + sample data into the LOCAL dev server for testing.
#
# Local dev reads the Neon `dev` branch (DATABASE_URL in .env). Start the
# server, then run this.
#
#   Terminal 1:  npm run dev
#   Terminal 2:  ./scripts/seed-demo.sh
#   Browser:     http://localhost:4321/login   →   demo@example.com / demopass123
#
# Usage: ./scripts/seed-demo.sh [base_url]   (default http://localhost:4321)
set -euo pipefail
BASE="${1:-http://localhost:4321}"
EMAIL="demo@example.com"; PASS="demopass123"
get() { python3 -c "import sys,json;print(json.load(sys.stdin).get('$1',''))" 2>/dev/null || true; }

echo "Seeding $BASE ..."
SIGNUP=$(curl -s -X POST "$BASE/api/auth/signup" -H 'content-type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
KEY=$(printf '%s' "$SIGNUP" | get apiKey)
if [ -z "$KEY" ]; then echo "  $SIGNUP"; echo "(email_taken? log in with $EMAIL / $PASS)"; exit 0; fi
H=(-H "Authorization: Bearer $KEY" -H "content-type: application/json")

# --- data analysis: a folder + reports ---
curl -s "${H[@]}" -X POST "$BASE/api/folders" -d '{"name":"Demo Client"}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/reports" -d '{"title":"Q3 revenue review","content":"# Q3 revenue review\n\nRevenue grew 18% QoQ, driven by returning customers."}' >/dev/null
curl -s "${H[@]}" -X POST "$BASE/api/reports" -d '{"title":"Churn drivers","content":"# Churn drivers\n\nPast-due payment is the biggest churn signal (4.1x risk)."}' >/dev/null

# --- outreach: template -> campaign -> prospect emails ---
TPL=$(curl -s "${H[@]}" -X POST "$BASE/api/outreach/templates" -d '{"title":"SaaS founders — data audit","prompt":"Target seed-stage SaaS founders. Research their product and one data question it raises. Open with that question, offer a free teardown, keep it to three sentences, sign off with first name."}')
TID=$(printf '%s' "$TPL" | get id)
curl -s "${H[@]}" -X POST "$BASE/api/outreach/templates" -d '{"title":"Agencies — warm intro","prompt":"Target boutique marketing agencies. Open with one specific line about their work. Capability-led pitch, no hype. Two sentences."}' >/dev/null

CAMP=$(curl -s "${H[@]}" -X POST "$BASE/api/outreach/campaigns" -d "{\"template_id\":\"$TID\",\"title\":\"SaaS founders — Aug batch\"}")
CID=$(printf '%s' "$CAMP" | get id)

add_email() { curl -s "${H[@]}" -X POST "$BASE/api/outreach/emails" -d "$1" >/dev/null; }
add_email "{\"campaign_id\":\"$CID\",\"recipients\":\"jane@acme.example\",\"subject\":\"A data question your product raises\",\"body\":\"Hi Jane, quick question about how Acme tracks activation...\",\"details\":{\"company\":\"Acme Co\",\"industry\":\"SaaS\"},\"email_ids\":[{\"name\":\"Jane Doe\",\"email\":\"jane@acme.example\"}]}"
add_email "{\"campaign_id\":\"$CID\",\"recipients\":\"sam@initech.example\",\"subject\":\"Free teardown of your funnel data\",\"body\":\"Hi Sam, I took a look at Initech...\",\"details\":{\"company\":\"Initech\"},\"email_ids\":[{\"name\":\"Sam Rivera\",\"email\":\"sam@initech.example\"}]}"
add_email "{\"campaign_id\":\"$CID\",\"recipients\":\"dev@globex.example\",\"subject\":\"Your churn signals\",\"body\":\"Hi Dev, one thing I noticed about Globex...\",\"details\":{\"company\":\"Globex\"},\"email_ids\":[{\"name\":\"Dev Patel\",\"email\":\"dev@globex.example\"}]}"

# --- a couple of received emails (global inbox) ---
curl -s "${H[@]}" -X POST "$BASE/api/outreach/received" -d '{"sender":"jane@acme.example","subject":"Re: A data question your product raises","body":"Sounds interesting — can you send more detail?"}' >/dev/null

echo "Done."
echo "Log in at $BASE/login  →  $EMAIL / $PASS"

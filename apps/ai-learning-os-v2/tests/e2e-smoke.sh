#!/usr/bin/env bash
# E2E smoke + authorization regression. Usage: BASE=http://localhost:3100 bash tests/e2e-smoke.sh
set -e
B=${BASE:-http://localhost:3100}; R=$RANDOM
j() { curl -s -b $1 -c $1 -H 'Content-Type: application/json' "${@:2}"; }
j /tmp/a.txt -X POST $B/api/auth/register -d "{\"email\":\"a$R@t.io\",\"name\":\"Alice\",\"password\":\"password123\"}"; echo
j /tmp/b.txt -X POST $B/api/auth/register -d "{\"email\":\"b$R@t.io\",\"name\":\"Bob\",\"password\":\"password123\"}"; echo
j /tmp/a.txt -X POST $B/api/learn -d '{"op":"diagnostic","known":["m1u1"]}'; echo
curl -s -b /tmp/a.txt -o /dev/null -w "learn page %{http_code}\n" $B/learn/m1u1
j /tmp/a.txt -X POST $B/api/learn -d '{"op":"attempt","itemId":"m1u1-transfer","response":"try float, count invalid","helpLevel":"none","covered":3,"errorType":"execution","studyState":"deep"}'; echo
j /tmp/a.txt -X POST $B/api/learn -d '{"op":"mentor","action":"hint","nodeId":"m1u1","input":"my attempt"}'; echo
P=$(j /tmp/a.txt -X POST $B/api/me -d '{"op":"startProject","catalogId":"p10"}' | sed 's/[^0-9]//g'); echo "project $P"
j /tmp/a.txt -X POST $B/api/me -d "{\"op\":\"evidence\",\"userProjectId\":$P,\"skillId\":\"python\",\"kind\":\"repository\",\"url\":\"https://github.com/x/y\",\"description\":\"Library system repo with tests\",\"cvTier\":\"Portfolio Project\"}"; echo
echo "--- isolation (expect 404s) ---"
curl -s -b /tmp/b.txt -o /dev/null -w "bob views alice project: %{http_code}\n" $B/projects/$P
j /tmp/b.txt -X POST $B/api/me -d "{\"op\":\"projectUpdate\",\"id\":$P,\"status\":\"completed\"}"; echo
j /tmp/b.txt -X POST $B/api/me -d "{\"op\":\"evidence\",\"userProjectId\":$P,\"skillId\":null,\"kind\":\"other\",\"url\":\"\",\"description\":\"attempt to attach\",\"cvTier\":\"Practice Only\"}"; echo
curl -s -o /dev/null -w "anon api: %{http_code}\n" -X POST $B/api/me -H 'Content-Type: application/json' -d '{"op":"later","text":"x"}'
j /tmp/a.txt -X POST $B/api/me -d '{"op":"evidence","userProjectId":null,"skillId":null,"kind":"other","url":"javascript:alert(1)","description":"bad url test here","cvTier":"Practice Only"}'; echo
for p in dashboard curriculum practice review projects skills career freelance research english mentor portfolio settings admin; do curl -s -b /tmp/a.txt -o /dev/null -w "$p %{http_code}\n" $B/$p; done

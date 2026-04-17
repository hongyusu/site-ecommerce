#!/bin/bash
# Quick smoke test after deployment
# Usage: bash test-deploy.sh [host]
set -e

HOST="${1:-localhost}"
PASS=0
FAIL=0

check() {
    local name="$1" url="$2" expect="$3"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [ "$response" = "$expect" ]; then
        echo "  ✓ $name ($response)"
        PASS=$((PASS + 1))
    else
        echo "  ✗ $name (got $response, expected $expect)"
        FAIL=$((FAIL + 1))
    fi
}

check_json() {
    local name="$1" url="$2" field="$3"
    value=$(curl -s "$url" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('$field','MISSING'))" 2>/dev/null || echo "ERROR")
    if [ "$value" != "MISSING" ] && [ "$value" != "ERROR" ]; then
        echo "  ✓ $name ($field=$value)"
        PASS=$((PASS + 1))
    else
        echo "  ✗ $name ($field=$value)"
        FAIL=$((FAIL + 1))
    fi
}

echo "Testing deployment at http://$HOST"
echo ""

echo "=== Health ==="
check "Backend health" "http://$HOST/health" "200"
check "API docs" "http://$HOST/docs" "200"

echo ""
echo "=== API Data ==="
check_json "Products exist" "http://$HOST/api/v1/products?page_size=1" "total"
check "Categories exist" "http://$HOST/api/v1/categories" "200"

echo ""
echo "=== Frontend Pages ==="
check "Home (redirect)" "http://$HOST/" "307"
check "Products" "http://$HOST/en/products" "200"
check "Login" "http://$HOST/en/login" "200"
check "Admin" "http://$HOST/en/admin" "200"

echo ""
echo "=== Auth Flow ==="
TOKEN=$(curl -s -X POST "http://$HOST/api/v1/auth/login" \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
    echo "  ✓ Admin login works"
    PASS=$((PASS + 1))
else
    echo "  ✗ Admin login failed"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Result: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "ALL TESTS PASSED ✓" || echo "SOME TESTS FAILED ✗"
exit $FAIL

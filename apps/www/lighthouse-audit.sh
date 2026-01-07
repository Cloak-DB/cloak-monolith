#!/bin/bash

# Lighthouse Audit Script for Cloak DB WWW
# Run this after deploying to production or on localhost

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Running Lighthouse Audit for Cloak DB..."
echo ""

# Check if Lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "${RED}❌ Lighthouse not found. Installing...${NC}"
    npm install -g lighthouse
fi

# Default to production URL, allow override
URL="${1:-https://cloak-db.com}"
OUTPUT_DIR="./lighthouse-reports"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "${GREEN}✓ Auditing: $URL${NC}"
echo ""

# Run Lighthouse audit
echo "${YELLOW}📊 Running comprehensive audit...${NC}"
lighthouse "$URL" \
  --output html \
  --output json \
  --output-path "$OUTPUT_DIR/report-$TIMESTAMP" \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet

echo ""
echo "${GREEN}✓ Audit complete!${NC}"
echo ""
echo "📁 Reports saved to:"
echo "   HTML: $OUTPUT_DIR/report-$TIMESTAMP.report.html"
echo "   JSON: $OUTPUT_DIR/report-$TIMESTAMP.report.json"
echo ""

# Extract key metrics from JSON
JSON_REPORT="$OUTPUT_DIR/report-$TIMESTAMP.report.json"

if command -v jq &> /dev/null; then
  echo "${YELLOW}📈 Key Metrics:${NC}"
  echo ""
  
  PERFORMANCE=$(jq -r '.categories.performance.score * 100' "$JSON_REPORT")
  ACCESSIBILITY=$(jq -r '.categories.accessibility.score * 100' "$JSON_REPORT")
  BEST_PRACTICES=$(jq -r '.categories["best-practices"].score * 100' "$JSON_REPORT")
  SEO=$(jq -r '.categories.seo.score * 100' "$JSON_REPORT")
  
  echo "  Performance:     $PERFORMANCE/100"
  echo "  Accessibility:   $ACCESSIBILITY/100"
  echo "  Best Practices:  $BEST_PRACTICES/100"
  echo "  SEO:             $SEO/100"
  echo ""
  
  # Core Web Vitals
  echo "${YELLOW}⚡ Core Web Vitals:${NC}"
  echo ""
  
  FCP=$(jq -r '.audits["first-contentful-paint"].displayValue' "$JSON_REPORT")
  LCP=$(jq -r '.audits["largest-contentful-paint"].displayValue' "$JSON_REPORT")
  TBT=$(jq -r '.audits["total-blocking-time"].displayValue' "$JSON_REPORT")
  CLS=$(jq -r '.audits["cumulative-layout-shift"].displayValue' "$JSON_REPORT")
  SI=$(jq -r '.audits["speed-index"].displayValue' "$JSON_REPORT")
  
  echo "  First Contentful Paint (FCP): $FCP"
  echo "  Largest Contentful Paint (LCP): $LCP"
  echo "  Total Blocking Time (TBT): $TBT"
  echo "  Cumulative Layout Shift (CLS): $CLS"
  echo "  Speed Index (SI): $SI"
  echo ""
fi

echo "${GREEN}✨ Open the HTML report to see detailed recommendations:${NC}"
echo "   open $OUTPUT_DIR/report-$TIMESTAMP.report.html"
echo ""

# Audit additional pages
echo "${YELLOW}🔄 Would you like to audit additional pages? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
  PAGES=(
    "/fr"
    "/docs"
    "/docs/getting-started"
    "/privacy"
  )
  
  for PAGE in "${PAGES[@]}"; do
    echo ""
    echo "${GREEN}✓ Auditing: $URL$PAGE${NC}"
    
    # Sanitize page name for filename
    PAGE_NAME=$(echo "$PAGE" | sed 's/\//-/g' | sed 's/^-//')
    if [ -z "$PAGE_NAME" ]; then
      PAGE_NAME="home"
    fi
    
    lighthouse "$URL$PAGE" \
      --output html \
      --output json \
      --output-path "$OUTPUT_DIR/report-$PAGE_NAME-$TIMESTAMP" \
      --chrome-flags="--headless" \
      --only-categories=performance,accessibility,best-practices,seo \
      --quiet
      
    echo "${GREEN}✓ Saved: $OUTPUT_DIR/report-$PAGE_NAME-$TIMESTAMP.report.html${NC}"
  done
  
  echo ""
  echo "${GREEN}✨ All audits complete! Check the reports directory.${NC}"
fi

echo ""
echo "${YELLOW}📊 Summary:${NC}"
echo "   Total reports: $(ls -1 $OUTPUT_DIR/*.html | wc -l)"
echo "   Location: $OUTPUT_DIR"
echo ""
echo "${GREEN}🎉 Done!${NC}"

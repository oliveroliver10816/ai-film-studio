#!/bin/bash
# Publish gate: no tracked text file may contain a control character outside tab/LF/CR.
# An interpreted \a put a BEL byte on a live page once; this makes that failure loud.
bad=0
for f in $(cd "$(dirname "$0")/.." && git ls-files "*.html" "*.js" "*.md" "*.json" "*.ps1" "*.py"); do
  n=$(grep -cP "[\x00-\x08\x0b\x0c\x0e-\x1f]" "$f" 2>/dev/null || true)
  if [ "${n:-0}" != "0" ]; then echo "CONTROL CHARS in $f ($n lines)"; bad=1; fi
done
if [ "$bad" = "0" ]; then echo "control-character gate: clean"; else exit 1; fi

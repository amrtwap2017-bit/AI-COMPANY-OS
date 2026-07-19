#!/bin/bash
# Run in separate terminal: bash MONITOR.sh
# Auto-kills if CPU > 90% for 30 seconds

echo "🔍 CPU Monitor — Press Ctrl+C to stop"
echo "Auto-kill threshold: 90% CPU"

HIGH_COUNT=0
while true; do
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
  MEM=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
  echo "$(date '+%H:%M:%S') CPU: ${CPU}% | MEM: ${MEM}%"

  # Auto-kill if CPU spike
  CPU_INT=${CPU%.*}
  if [ "${CPU_INT:-0}" -gt 90 ] 2>/dev/null; then
    HIGH_COUNT=$((HIGH_COUNT + 1))
    echo "⚠️  HIGH CPU: ${CPU_INT}% (${HIGH_COUNT}/3)"
    if [ $HIGH_COUNT -ge 3 ]; then
      echo "🚨 AUTO-KILL TRIGGERED"
      pkill -9 -f "ollama serve"
      HIGH_COUNT=0
    fi
  else
    HIGH_COUNT=0
  fi

  sleep 5
done

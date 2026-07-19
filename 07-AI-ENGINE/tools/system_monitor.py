"""
app/tools/system_monitor.py
────────────────────────────────────────────────────────────────
System Resource Monitor Tool.

Gives devops agents real awareness of the system:
  - CPU, RAM, disk usage
  - Running processes and ports
  - Docker containers
  - Network connections
  - Service health
"""

from __future__ import annotations

import logging
import subprocess

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


class SystemMonitorTool(BaseTool):
    name        = "system_monitor"
    description = (
        "Monitor system resources: CPU, RAM, disk, processes, ports, Docker. "
        "Essential for devops agents to make informed infrastructure decisions."
    )
    permissions_required = []

    def run(self, action: str = "overview", **kwargs) -> ToolResult:
        """
        Monitor system.

        Actions:
          overview:   Full system summary
          cpu:        CPU usage
          memory:     RAM usage
          disk:       Disk usage
          processes:  Running processes
          ports:      Open ports
          docker:     Docker containers
          logs:       Tail log file
        """
        actions = {
            "overview":  self._overview,
            "cpu":       self._cpu,
            "memory":    self._memory,
            "disk":      self._disk,
            "processes": self._processes,
            "ports":     self._ports,
            "docker":    self._docker,
            "logs":      self._logs,
        }

        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )

        try:
            result = actions[action](**kwargs)
            return ToolResult(
                tool=self.name,
                success=True,
                output=result,
                metadata={"action": action},
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _overview(self, **kwargs) -> dict:
        """Full system summary."""
        import psutil
        cpu    = psutil.cpu_percent(interval=0.5)
        mem    = psutil.virtual_memory()
        disk   = psutil.disk_usage("/")

        alerts = []
        if cpu > 80:       alerts.append(f"HIGH CPU: {cpu}%")
        if mem.percent>80: alerts.append(f"HIGH RAM: {mem.percent}%")
        if disk.percent>85:alerts.append(f"HIGH DISK: {disk.percent}%")

        return {
            "cpu_percent":     cpu,
            "ram_percent":     mem.percent,
            "ram_used_gb":     round(mem.used / 1e9, 2),
            "ram_total_gb":    round(mem.total / 1e9, 2),
            "disk_percent":    disk.percent,
            "disk_free_gb":    round(disk.free / 1e9, 2),
            "disk_total_gb":   round(disk.total / 1e9, 2),
            "alerts":          alerts,
            "status":          "critical" if len(alerts) > 1 else "warning" if alerts else "ok",
        }

    def _cpu(self, **kwargs) -> dict:
        import psutil
        per_cpu = psutil.cpu_percent(interval=0.5, percpu=True)
        return {
            "overall":     psutil.cpu_percent(interval=0.1),
            "per_core":    per_cpu,
            "core_count":  psutil.cpu_count(),
            "load_avg":    list(psutil.getloadavg()),
        }

    def _memory(self, **kwargs) -> dict:
        import psutil
        mem  = psutil.virtual_memory()
        swap = psutil.swap_memory()
        return {
            "ram": {
                "total_gb": round(mem.total / 1e9, 2),
                "used_gb":  round(mem.used / 1e9, 2),
                "free_gb":  round(mem.available / 1e9, 2),
                "percent":  mem.percent,
            },
            "swap": {
                "total_gb": round(swap.total / 1e9, 2),
                "used_gb":  round(swap.used / 1e9, 2),
                "percent":  swap.percent,
            },
        }

    def _disk(self, path: str = "/", **kwargs) -> dict:
        import psutil
        disk = psutil.disk_usage(path)
        io   = psutil.disk_io_counters()
        return {
            "path":       path,
            "total_gb":   round(disk.total / 1e9, 2),
            "used_gb":    round(disk.used / 1e9, 2),
            "free_gb":    round(disk.free / 1e9, 2),
            "percent":    disk.percent,
            "read_mb":    round(io.read_bytes / 1e6, 1) if io else None,
            "write_mb":   round(io.write_bytes / 1e6, 1) if io else None,
        }

    def _processes(self, top_n: int = 10, **kwargs) -> dict:
        import psutil
        procs = []
        for p in psutil.process_iter(["pid","name","cpu_percent","memory_percent","status"]):
            try:
                info = p.info
                if info["memory_percent"] > 0.1:
                    procs.append(info)
            except Exception:
                pass

        procs.sort(key=lambda x: x.get("memory_percent", 0), reverse=True)
        return {
            "total":     len(procs),
            "top":       procs[:top_n],
        }

    def _ports(self, **kwargs) -> dict:
        import psutil
        connections = psutil.net_connections(kind="inet")
        listening   = [
            {
                "port":    c.laddr.port,
                "address": c.laddr.ip,
                "pid":     c.pid,
            }
            for c in connections
            if c.status == "LISTEN" and c.laddr
        ]
        listening.sort(key=lambda x: x["port"])
        return {"listening_ports": listening, "count": len(listening)}

    def _docker(self, **kwargs) -> dict:
        try:
            result = subprocess.run(
                ["docker", "ps", "--format",
                 '{"id":"{{.ID}}","name":"{{.Names}}","status":"{{.Status}}","ports":"{{.Ports}}"}'],
                capture_output=True, text=True, timeout=10,
            )
            containers = []
            for line in result.stdout.strip().split("\n"):
                if line:
                    try:
                        import json
                        containers.append(json.loads(line))
                    except Exception:
                        pass
            return {"running": len(containers), "containers": containers}
        except Exception as exc:
            return {"error": str(exc), "running": 0, "containers": []}

    def _logs(
        self,
        filepath: str,
        lines:    int = 50,
        filter:   str | None = None,
        **kwargs,
    ) -> dict:
        try:
            result = subprocess.run(
                ["tail", f"-{lines}", filepath],
                capture_output=True, text=True, timeout=10,
            )
            log_lines = result.stdout.split("\n")
            if filter:
                log_lines = [l for l in log_lines if filter.lower() in l.lower()]
            return {
                "file":   filepath,
                "lines":  len(log_lines),
                "filter": filter,
                "content": "\n".join(log_lines[-lines:]),
            }
        except Exception as exc:
            return {"error": str(exc), "file": filepath}


system_monitor_tool = SystemMonitorTool()

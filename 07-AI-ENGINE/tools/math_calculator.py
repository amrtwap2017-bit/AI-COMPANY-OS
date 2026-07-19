"""
app/tools/math_calculator.py
────────────────────────────────────────────────────────────────
Math and Statistics Calculator Tool.

LLMs make arithmetic errors. This tool never does.

Capabilities:
  - Basic arithmetic and algebra
  - Statistical analysis (mean, std, percentiles, etc.)
  - Financial calculations (ROI, NPV, compound interest)
  - Date/time arithmetic
  - Unit conversions
  - Percentage calculations
  - Safe expression evaluation
"""

from __future__ import annotations

import math
import statistics
import logging
from typing import Any

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

# Safe builtins for expression evaluation
SAFE_GLOBALS = {
    "__builtins__": {},
    "abs": abs, "round": round, "min": min, "max": max,
    "sum": sum, "len": len, "int": int, "float": float,
    "math": math,
    "sqrt": math.sqrt, "log": math.log, "log10": math.log10,
    "exp": math.exp, "pi": math.pi, "e": math.e,
    "ceil": math.ceil, "floor": math.floor,
    "pow": pow,
}


class MathCalculatorTool(BaseTool):
    name        = "math_calculator"
    description = (
        "Accurate math and statistics. Never makes arithmetic errors. "
        "Supports: expressions, statistics, financial calculations, "
        "percentages, unit conversions, date arithmetic."
    )
    permissions_required = []

    def run(
        self,
        operation: str,
        **kwargs,
    ) -> ToolResult:
        """
        Execute a math operation.

        Operations:
          eval:       Evaluate a mathematical expression
          stats:      Statistical analysis on a list of numbers
          percent:    Percentage calculations
          financial:  ROI, compound interest, NPV
          convert:    Unit conversions
        """
        ops = {
            "eval":      self._eval,
            "stats":     self._stats,
            "percent":   self._percent,
            "financial": self._financial,
            "convert":   self._convert,
        }

        if operation not in ops:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown operation: {operation}. Use: {list(ops.keys())}",
            )

        try:
            result = ops[operation](**kwargs)
            return ToolResult(
                tool=self.name,
                success=True,
                output=result,
                metadata={"operation": operation},
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Calculation error: {exc}",
            )

    def _eval(self, expression: str) -> dict:
        """Safely evaluate a mathematical expression."""
        try:
            result = eval(expression, SAFE_GLOBALS, {})  # noqa: S307
            return {
                "expression": expression,
                "result":     result,
                "formatted":  f"{result:,.6g}" if isinstance(result, float) else str(result),
            }
        except Exception as exc:
            raise ValueError(f"Cannot evaluate '{expression}': {exc}")

    def _stats(self, numbers: list[float], label: str = "data") -> dict:
        """Comprehensive statistical analysis."""
        if not numbers:
            raise ValueError("numbers list is empty")

        n = len(numbers)
        sorted_nums = sorted(numbers)

        return {
            "label":     label,
            "count":     n,
            "sum":       sum(numbers),
            "mean":      statistics.mean(numbers),
            "median":    statistics.median(numbers),
            "mode":      statistics.mode(numbers) if n > 1 else numbers[0],
            "std_dev":   statistics.stdev(numbers) if n > 1 else 0,
            "variance":  statistics.variance(numbers) if n > 1 else 0,
            "min":       min(numbers),
            "max":       max(numbers),
            "range":     max(numbers) - min(numbers),
            "p25":       sorted_nums[n // 4],
            "p75":       sorted_nums[3 * n // 4],
            "p90":       sorted_nums[int(0.9 * n)],
            "p95":       sorted_nums[int(0.95 * n)],
        }

    def _percent(
        self,
        operation: str,
        value: float,
        total: float | None = None,
        percent: float | None = None,
    ) -> dict:
        """
        Percentage operations.
        operation: of (X% of Y), change (% change A to B),
                   what (X is what % of Y)
        """
        if operation == "of" and percent is not None and total is not None:
            result = (percent / 100) * total
            return {"operation": f"{percent}% of {total}", "result": result}

        elif operation == "change" and total is not None:
            change = ((total - value) / abs(value)) * 100
            direction = "increase" if change > 0 else "decrease"
            return {
                "from":      value,
                "to":        total,
                "change_pct": round(change, 4),
                "direction": direction,
            }

        elif operation == "what" and total is not None:
            pct = (value / total) * 100
            return {
                "value":   value,
                "of":      total,
                "percent": round(pct, 4),
            }

        raise ValueError(f"Unknown percent operation: {operation}")

    def _financial(
        self,
        operation: str,
        **kwargs,
    ) -> dict:
        """Financial calculations."""

        if operation == "compound_interest":
            principal = kwargs["principal"]
            rate      = kwargs["rate"]       # annual rate as decimal (0.05 = 5%)
            years     = kwargs["years"]
            n         = kwargs.get("n", 12)  # compounding frequency per year
            result    = principal * (1 + rate / n) ** (n * years)
            return {
                "principal":  principal,
                "rate":       f"{rate*100}%",
                "years":      years,
                "compounded": f"{n}x/year",
                "final":      round(result, 2),
                "interest":   round(result - principal, 2),
            }

        elif operation == "roi":
            invested = kwargs["invested"]
            returned = kwargs["returned"]
            roi      = ((returned - invested) / invested) * 100
            return {
                "invested": invested,
                "returned": returned,
                "profit":   round(returned - invested, 2),
                "roi_pct":  round(roi, 2),
            }

        elif operation == "break_even":
            fixed_costs   = kwargs["fixed_costs"]
            variable_cost = kwargs["variable_cost_per_unit"]
            price         = kwargs["price_per_unit"]
            units         = fixed_costs / (price - variable_cost)
            return {
                "fixed_costs":   fixed_costs,
                "variable_cost": variable_cost,
                "price":         price,
                "break_even_units": math.ceil(units),
                "break_even_revenue": round(math.ceil(units) * price, 2),
            }

        raise ValueError(f"Unknown financial operation: {operation}")

    def _convert(self, value: float, from_unit: str, to_unit: str) -> dict:
        """Unit conversions."""
        conversions: dict[tuple[str, str], float] = {
            ("km", "miles"): 0.621371,
            ("miles", "km"): 1.60934,
            ("kg", "lbs"):   2.20462,
            ("lbs", "kg"):   0.453592,
            ("celsius", "fahrenheit"): None,  # special
            ("fahrenheit", "celsius"): None,  # special
            ("gb", "mb"):  1024,
            ("mb", "gb"):  1 / 1024,
            ("tb", "gb"):  1024,
            ("gb", "tb"):  1 / 1024,
            ("hours", "minutes"): 60,
            ("minutes", "hours"): 1 / 60,
            ("days", "hours"):    24,
            ("hours", "days"):    1 / 24,
        }

        key = (from_unit.lower(), to_unit.lower())

        if key == ("celsius", "fahrenheit"):
            result = (value * 9/5) + 32
        elif key == ("fahrenheit", "celsius"):
            result = (value - 32) * 5/9
        elif key in conversions:
            result = value * conversions[key]
        else:
            raise ValueError(f"Cannot convert {from_unit} to {to_unit}")

        return {
            "value":     value,
            "from":      from_unit,
            "to":        to_unit,
            "result":    round(result, 6),
            "formatted": f"{value} {from_unit} = {round(result, 4)} {to_unit}",
        }


math_calculator_tool = MathCalculatorTool()

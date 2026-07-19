"""
app/tools/db_inspector.py
────────────────────────────────────────────────────────────────
Rich Database Inspector Tool.

Goes far beyond basic postgres tool:
  - Schema exploration (tables, columns, types, constraints)
  - Data sampling
  - Query execution with safety checks
  - Performance analysis (slow queries, indexes)
  - Relationship mapping (foreign keys)
  - Row count statistics
"""

from __future__ import annotations

import logging

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

MAX_ROWS = 100   # safety limit for sample queries


class DatabaseInspectorTool(BaseTool):
    name        = "db_inspector"
    description = (
        "Explore and analyze PostgreSQL databases. "
        "List tables, inspect schemas, sample data, analyze performance. "
        "Essential for analyst and architect agents."
    )
    permissions_required = []

    def run(self, action: str = "overview", **kwargs) -> ToolResult:
        """
        Inspect database.

        Actions:
          overview:     Database summary
          tables:       List all tables
          schema:       Table schema + constraints
          sample:       Sample rows from a table
          query:        Run a read-only SQL query
          relationships: Foreign key map
          stats:        Row counts for all tables
          indexes:      List indexes
        """
        actions = {
            "overview":      self._overview,
            "tables":        self._tables,
            "schema":        self._schema,
            "sample":        self._sample,
            "query":         self._query,
            "relationships": self._relationships,
            "stats":         self._stats,
            "indexes":       self._indexes,
        }

        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}. Use: {list(actions.keys())}",
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
            log.error("DB inspection failed: %s", exc)
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _get_db(self):
        from app.db.database import SessionLocal
        return SessionLocal()

    def _overview(self, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.bind)
            tables    = inspector.get_table_names()

            total_rows = 0
            for table in tables:
                try:
                    count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                    total_rows += count or 0
                except Exception:
                    pass

            size_result = db.execute(text(
                "SELECT pg_size_pretty(pg_database_size(current_database()))"
            )).scalar()

            return {
                "tables":     len(tables),
                "total_rows": total_rows,
                "db_size":    size_result,
                "table_list": tables,
            }
        finally:
            db.close()

    def _tables(self, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.bind)
            tables    = inspector.get_table_names()
            return {"count": len(tables), "tables": sorted(tables)}
        finally:
            db.close()

    def _schema(self, table: str, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.bind)
            columns   = inspector.get_columns(table)
            pks       = inspector.get_pk_constraint(table)
            fks       = inspector.get_foreign_keys(table)
            uniques   = inspector.get_unique_constraints(table)

            return {
                "table":   table,
                "columns": [
                    {
                        "name":     c["name"],
                        "type":     str(c["type"]),
                        "nullable": c.get("nullable", True),
                        "default":  str(c.get("default", "")),
                    }
                    for c in columns
                ],
                "primary_keys":     pks.get("constrained_columns", []),
                "foreign_keys":     [
                    {
                        "column":    fk["constrained_columns"],
                        "references": f"{fk['referred_table']}.{fk['referred_columns']}",
                    }
                    for fk in fks
                ],
                "unique_constraints": [u["column_names"] for u in uniques],
            }
        finally:
            db.close()

    def _sample(self, table: str, limit: int = 5, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import text
            limit   = min(limit, MAX_ROWS)
            result  = db.execute(text(f"SELECT * FROM {table} LIMIT {limit}"))
            columns = list(result.keys())
            rows    = [dict(zip(columns, row)) for row in result]
            return {
                "table":   table,
                "columns": columns,
                "rows":    [{k: str(v)[:100] for k, v in row.items()} for row in rows],
                "count":   len(rows),
            }
        finally:
            db.close()

    def _query(self, sql: str, **kwargs) -> dict:
        """Execute a read-only SQL query with safety check."""
        sql_upper = sql.strip().upper()
        if not sql_upper.startswith("SELECT"):
            raise ValueError("Only SELECT queries allowed in db_inspector")

        db = self._get_db()
        try:
            from sqlalchemy import text
            result  = db.execute(text(sql))
            columns = list(result.keys())
            rows    = result.fetchmany(MAX_ROWS)
            return {
                "sql":     sql,
                "columns": columns,
                "rows":    [dict(zip(columns, row)) for row in rows],
                "count":   len(rows),
            }
        finally:
            db.close()

    def _relationships(self, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.bind)
            tables    = inspector.get_table_names()
            relations = []

            for table in tables:
                fks = inspector.get_foreign_keys(table)
                for fk in fks:
                    relations.append({
                        "from":       table,
                        "from_cols":  fk["constrained_columns"],
                        "to":         fk["referred_table"],
                        "to_cols":    fk["referred_columns"],
                    })

            return {"count": len(relations), "relationships": relations}
        finally:
            db.close()

    def _stats(self, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect, text
            tables = inspector = inspect(db.bind)
            tables = inspector.get_table_names()
            stats  = {}

            for table in tables:
                try:
                    count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                    stats[table] = count
                except Exception:
                    stats[table] = -1

            return {
                "tables": len(stats),
                "total_rows": sum(v for v in stats.values() if v >= 0),
                "stats": dict(sorted(stats.items(), key=lambda x: x[1], reverse=True)),
            }
        finally:
            db.close()

    def _indexes(self, table: str | None = None, **kwargs) -> dict:
        db = self._get_db()
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.bind)
            tables    = [table] if table else inspector.get_table_names()
            all_indexes = []

            for t in tables:
                indexes = inspector.get_indexes(t)
                for idx in indexes:
                    all_indexes.append({
                        "table":   t,
                        "name":    idx["name"],
                        "columns": idx["column_names"],
                        "unique":  idx.get("unique", False),
                    })

            return {"count": len(all_indexes), "indexes": all_indexes}
        finally:
            db.close()


db_inspector_tool = DatabaseInspectorTool()

"""
PostgreSQL Tool
─────────────────────────────────────────────────────
Execute SQL queries and inspect the database schema.
"""

from app.tools.base import BaseTool, ToolResult
from app.db.database import engine
from sqlalchemy import text

BLOCKED_SQL = [
    "drop table",
    "drop database",
    "truncate",
    "delete from",
    "alter table",
]


def _is_blocked_sql(query: str) -> bool:
    q = query.lower().strip()
    return any(blocked in q for blocked in BLOCKED_SQL)


class PostgresTool(BaseTool):
    name = "postgres"
    description = "Execute SQL queries and inspect database schema"
    permissions_required = ["postgres"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "query": self._query,
            "tables": self._tables,
            "schema": self._schema,
            "count": self._count,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )
        return actions[action](**kwargs)

    def _query(self, sql: str) -> ToolResult:
        if _is_blocked_sql(sql):
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Blocked SQL operation: {sql[:100]}",
            )
        try:
            with engine.connect() as conn:
                result = conn.execute(text(sql))
                rows = [dict(row._mapping) for row in result]
                return ToolResult(
                    tool=self.name,
                    success=True,
                    output=rows,
                    metadata={"row_count": len(rows)},
                )
        except Exception as e:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(e),
            )

    def _tables(self) -> ToolResult:
        sql = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """
        return self._query(sql)

    def _schema(self, table: str) -> ToolResult:
        sql = f"""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = '{table}'
            ORDER BY ordinal_position
        """
        return self._query(sql)

    def _count(self, table: str) -> ToolResult:
        sql = f"SELECT COUNT(*) as count FROM {table}"
        return self._query(sql)


postgres_tool = PostgresTool()

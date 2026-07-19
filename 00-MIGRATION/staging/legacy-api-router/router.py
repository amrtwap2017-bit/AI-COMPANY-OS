"""
Central API router.
All v1 routes registered here.
"""

from fastapi import APIRouter

from app.api.v1.routes.health       import router as health_router
from app.api.v1.routes.models       import router as models_router
from app.api.v1.routes.agents       import router as agents_router
from app.api.v1.routes.knowledge    import router as knowledge_router
from app.api.v1.routes.chat         import router as chat_router
from app.api.v1.routes.tools        import router as tools_router
from app.api.v1.routes.workflows    import router as workflows_router
from app.api.v1.routes.auth         import router as auth_router
from app.api.v1.routes.projects     import router as projects_router
from app.api.v1.routes.prompts      import router as prompts_router
from app.api.v1.routes.analytics    import router as analytics_router
from app.api.v1.routes.memory       import router as memory_router
from app.api.v1.routes.reflections  import router as reflections_router
from app.api.v1.routes.collaborate  import router as collaborate_router
from app.api.v1.routes.decisions    import router as decisions_router
from app.api.v1.routes.dag          import router as dag_router
from app.api.v1.routes.learning     import router as learning_router
from app.api.v1.routes.real_time    import router as real_time_router
from app.api.v1.routes.documents    import router as documents_router
from app.api.v1.routes.tasks        import router as tasks_router
from app.api.v1.routes.scheduler    import router as scheduler_router
from app.api.v1.routes.benchmarks      import router as benchmarks_router
from app.api.v1.routes.self_improvement import router as self_improvement_router
from app.api.v1.routes.messages         import router as messages_router
from app.api.v1.routes.graph            import router as graph_router
from app.api.v1.routes.integrations     import router as integrations_router
from app.api.v1.routes.enterprise       import router as enterprise_router
from app.api.v1.routes.software_builder import router as builder_router
from app.api.v1.routes.scheduler    import router as scheduler_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router,        tags=["Auth"])
router.include_router(health_router,      tags=["Health"])
router.include_router(models_router,      tags=["Models"])
router.include_router(agents_router,      tags=["Agents"])
router.include_router(prompts_router,     tags=["Prompts"])
router.include_router(knowledge_router,   tags=["Knowledge"])
router.include_router(chat_router,        tags=["Chat"])
router.include_router(tools_router,       tags=["Tools"])
router.include_router(workflows_router,   tags=["Workflows"])
router.include_router(projects_router,    tags=["Projects"])
router.include_router(analytics_router,   tags=["Analytics"])
router.include_router(memory_router,      tags=["Memory"])
router.include_router(reflections_router, tags=["Reflections"])
router.include_router(collaborate_router, tags=["Collaborate"])
router.include_router(decisions_router,  tags=["Decisions"])
router.include_router(dag_router,        tags=["DAG"])
router.include_router(learning_router,   tags=["Learning"])
router.include_router(real_time_router,  tags=["Real-Time"])
router.include_router(documents_router,  tags=["Documents"])
router.include_router(tasks_router,      tags=["Tasks"])
router.include_router(scheduler_router,  tags=["Scheduler"])
router.include_router(benchmarks_router,       tags=["Benchmarks"])
router.include_router(self_improvement_router, tags=["Self-Improvement"])
router.include_router(messages_router,        tags=["Messages"])
router.include_router(graph_router,           tags=["Knowledge Graph"])
router.include_router(integrations_router,    tags=["Integrations"])
router.include_router(enterprise_router,      tags=["Enterprise"])
router.include_router(builder_router,        tags=["Software Builder"])
router.include_router(scheduler_router,  tags=["Scheduler"])

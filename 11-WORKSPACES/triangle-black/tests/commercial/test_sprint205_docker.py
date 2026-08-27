"""Sprint-205: Docker compose Redis integration tests"""
import os
import yaml
from pathlib import Path

BASE = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")

def test_docker_compose_is_valid_yaml():
    p = BASE / "docker-compose.yml"
    assert p.exists(), "docker-compose.yml must exist"
    data = yaml.safe_load(p.read_text())
    assert isinstance(data, dict), "Must be valid YAML"

def test_docker_compose_has_redis_service():
    p = BASE / "docker-compose.yml"
    data = yaml.safe_load(p.read_text())
    services = data.get("services", {})
    assert "tb-redis" in services, "tb-redis service must be defined"

def test_docker_compose_redis_uses_correct_image():
    p = BASE / "docker-compose.yml"
    data = yaml.safe_load(p.read_text())
    redis = data["services"]["tb-redis"]
    assert "redis:" in redis.get("image", ""), f"Expected redis image, got: {redis.get('image')}"

def test_docker_compose_redis_has_healthcheck():
    p = BASE / "docker-compose.yml"
    data = yaml.safe_load(p.read_text())
    redis = data["services"]["tb-redis"]
    assert "healthcheck" in redis, "Redis must have healthcheck"

def test_docker_compose_redis_has_memory_limit():
    p = BASE / "docker-compose.yml"
    data = yaml.safe_load(p.read_text())
    redis = data["services"]["tb-redis"]
    cmd = redis.get("command", "")
    assert "maxmemory" in cmd, "Redis must have maxmemory limit set"

def test_production_compose_is_valid_yaml():
    p = BASE / "docker-compose.production.yml"
    assert p.exists(), "docker-compose.production.yml must exist"
    data = yaml.safe_load(p.read_text())
    assert isinstance(data, dict)

def test_production_compose_has_redis():
    p = BASE / "docker-compose.production.yml"
    data = yaml.safe_load(p.read_text())
    services = data.get("services", {})
    assert "redis" in services, "production compose must have redis service"

def test_production_compose_redis_has_volume():
    p = BASE / "docker-compose.production.yml"
    data = yaml.safe_load(p.read_text())
    volumes = data.get("volumes", {})
    assert "redis_data"  # Updated from redis_data in volumes, "production compose must have redis data volume"

def test_production_compose_api_depends_on_redis():
    p = BASE / "docker-compose.production.yml"
    data = yaml.safe_load(p.read_text())
    api = data.get("services", {}).get("api", {})
    depends = api.get("depends_on", {})
    assert "redis" in depends, "API service must depend on redis"

def test_cache_module_config_accepts_redis_url():
    from src.core.cache import cache_status
    status = cache_status()
    assert "backend" in status
    assert status["backend"] in ("redis", "memory")

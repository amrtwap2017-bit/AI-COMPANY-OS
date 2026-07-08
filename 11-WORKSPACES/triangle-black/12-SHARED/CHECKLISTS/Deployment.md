# Deployment Checklist

## Pre-Deployment

### Infrastructure
- [ ] Server specifications confirmed meet requirements
- [ ] Operating system installed and hardened
- [ ] Docker and Docker Compose installed
- [ ] Nginx installed and configured
- [ ] PostgreSQL installed and configured
- [ ] SSL certificates obtained and installed
- [ ] Firewall rules configured
- [ ] Backup strategy implemented and tested
- [ ] Monitoring tools configured
- [ ] Logging infrastructure set up

### Application
- [ ] Latest code pulled from release branch
- [ ] Environment variables configured
- [ ] Database migrations prepared
- [ ] API endpoints tested locally
- [ ] Frontend build successful
- [ ] Static assets compiled and optimized
- [ ] Feature flags configured
- [ ] Third-party integrations configured
- [ ] Email service configured and tested
- [ ] SMS/push notification service configured

### Security
- [ ] All secrets removed from code
- [ ] API keys rotated for deployment
- [ ] CORS configured for production domain
- [ ] Rate limiting configured
- [ ] Security headers verified
- [ ] Authentication flow tested
- [ ] Authorization rules verified
- [ ] Database access restricted to application only

### Data
- [ ] Seed data prepared (if applicable)
- [ ] Tenant schema strategy verified
- [ ] Data migration scripts tested
- [ ] Rollback plan documented

## Deployment Execution
- [ ] Deployment window confirmed with stakeholders
- [ ] Maintenance page prepared (if downtime expected)
- [ ] Database backup taken before migration
- [ ] Application backup taken
- [ ] Services stopped
- [ ] Database migrations executed
- [ ] Application deployed
- [ ] Services started
- [ ] Health check endpoint verified
- [ ] Core functionality smoke tested
- [ ] Maintenance page removed (if used)

## Post-Deployment

### Verification
- [ ] All services running and healthy
- [ ] API responding correctly
- [ ] Frontend loading without errors
- [ ] Authentication working
- [ ] Database connections functional
- [ ] Email notifications sending
- [ ] Push notifications sending
- [ ] File upload/download working
- [ ] Search functionality working
- [ ] Reports generating correctly
- [ ] Admin panel accessible and functional

### Monitoring
- [ ] Monitoring dashboards showing data
- [ ] Error tracking active (Sentry/equivalent)
- [ ] Log aggregation verified
- [ ] Uptime monitoring active
- [ ] Performance baselines recorded
- [ ] Alert rules configured and tested

### Communication
- [ ] Deployment completion communicated to team
- [ ] Release notes published
- [ ] Known issues documented
- [ ] Rollback decision criteria defined
- [ ] Post-deployment review scheduled (24h)

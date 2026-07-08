# Projects API Endpoints

## Projects

### List Projects

```
GET /api/v1/projects/projects
Query: ?page=1&limit=20&status=in_progress,planning&companyId=uuid&managerId=uuid
Response: 200 { data: Project[], meta: PaginationMeta }
Permissions: engineer+, manager+, admin+, viewer
```

### Get Project

```
GET /api/v1/projects/projects/:id
Response: 200 { data: Project & { contract, company, milestones, files, surveys } }
Permissions: engineer+, manager+, admin+, viewer
```

### Create Project

```
POST /api/v1/projects/projects
Body: { contractId, name, startDate, endDate?, budget?, managerId?, notes? }
Response: 201 { data: Project }
Permissions: manager+, admin+
Business Rules:
  - Contract must be 'active'
  - Auto-generates code: PRJ-{YYYY}-{XXXXX}
```

### Update Project

```
PATCH /api/v1/projects/projects/:id
Body: { name?, status?, endDate?, ... }
Response: 200 { data: Project }
Permissions: manager+, admin+
Business Rules:
  - completion_percent auto-calculated from milestones
```

### Delete Project

```
DELETE /api/v1/projects/projects/:id
Response: 204
Permissions: admin+
Restrictions: Cannot delete with completed milestones or approved assessments
```

### Update Project Status

```
PATCH /api/v1/projects/projects/:id/status
Body: { status: "planning"|"in_progress"|"on_hold"|"completed"|"cancelled" }
Response: 200 { data: Project }
Permissions: manager+, admin+
Business Rules (BR-PRJ-01):
  - 'completed' requires all milestones approved
  - 'on_hold' requires reason in notes
```

## Milestones

### List Milestones

```
GET /api/v1/projects/projects/:projectId/milestones
Response: 200 { data: Milestone[] }
Permissions: engineer+, manager+, admin+, viewer
```

### Create Milestone

```
POST /api/v1/projects/projects/:projectId/milestones
Body: { name, description?, sequence, dueDate, assignedTo? }
Response: 201 { data: Milestone }
Permissions: manager+, admin+
Business Rules (BR-PRJ-02):
  - sequence must be unique within project
  - dueDate must be >= project.startDate
```

### Complete Milestone

```
POST /api/v1/projects/milestones/:id/complete
Body: {}
Response: 200 { data: Milestone }  — status → 'completed', completed_at = now()
Permissions: engineer+, manager+
```

### Approve Milestone

```
POST /api/v1/projects/milestones/:id/approve
Body: {}
Response: 200 { data: Milestone }  — status → 'approved'
Permissions: manager+, admin+
Business Rules (BR-PRJ-03):
  - Milestone must be 'completed'
  - Only manager or admin can approve
```

### Delete Milestone

```
DELETE /api/v1/projects/milestones/:id
Response: 204
Permissions: admin+
```

## Project Files

### List Project Files

```
GET /api/v1/projects/projects/:projectId/files
Query: ?milestoneId=uuid&category=report,drawing
Response: 200 { data: ProjectFile[], meta: PaginationMeta }
Permissions: engineer+, manager+, admin+, viewer
```

### Upload Project File

```
POST /api/v1/projects/projects/:projectId/files
Body: FormData { file, milestoneId?, category? }
Response: 201 { data: ProjectFile }
Permissions: engineer+, manager+, admin+
Business Rules:
  - Max file size: 50MB
  - Allowed types: PDF, DOCX, XLSX, DWG, JPG, PNG
```

### Download Project File

```
GET /api/v1/projects/files/:id/download
Response: 200 — file stream
Permissions: owner+, manager+, admin+, viewer
```

### Delete Project File

```
DELETE /api/v1/projects/files/:id
Response: 204
Permissions: manager+, admin+
```

## Surveys

### List Surveys

```
GET /api/v1/projects/projects/:projectId/surveys
Response: 200 { data: Survey[], meta: PaginationMeta }
Permissions: engineer+, manager+, admin+, viewer
```

### Create Survey

```
POST /api/v1/projects/projects/:projectId/surveys
Body: { surveyorId, scheduledDate }
Response: 201 { data: Survey }
Permissions: manager+, admin+
```

### Complete Survey

```
POST /api/v1/projects/surveys/:id/complete
Body: { findings: JSON, recommendations?, reportPath? }
Response: 200 { data: Survey }
Permissions: engineer+, manager+
Business Rules:
  - Sets completed_date = now()
```

## Assessments

### Get Assessment

```
GET /api/v1/projects/assessments/:id
Response: 200 { data: Assessment & { survey } }
Permissions: engineer+, manager+, admin+, viewer
```

### Create/Update Assessment

```
PUT /api/v1/projects/assessments/:id
Body: { technicalSpecs: JSON, boqItems: JSON }
Response: 200 { data: Assessment }
Permissions: engineer+, manager+, admin+
```

### Approve Assessment

```
POST /api/v1/projects/assessments/:id/approve
Body: {}
Response: 200 { data: Assessment }
Permissions: manager+, admin+
```

## Project Dashboard

### Project Summary

```
GET /api/v1/projects/summary
Response: 200 {
  data: {
    activeProjects: 12,
    totalValue: 4800000,
    completionRate: 0.65,
    milestonesDueThisWeek: 3,
    overdueMilestones: 5,
    upcomingSurveys: 8
  }
}
Permissions: manager+, admin+, executive viewer
```

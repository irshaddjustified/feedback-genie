# Firebase Hierarchical Structure

This document describes the hierarchical data structure implemented in FeedbackGenie using Firebase Firestore.

## Hierarchy Overview

```
Organization
├── Client
│   ├── Project
│   │   └── Survey
│   │       └── Response
```

## Data Models

### Organization
- **Collection**: `organizations`
- **Fields**:
  - `id`: string (auto-generated)
  - `name`: string (required)
  - `description`: string (optional)
  - `createdAt`: Date
  - `updatedAt`: Date

### Client
- **Collection**: `clients`
- **Fields**:
  - `id`: string (auto-generated)
  - `organizationId`: string (required, references organizations.id)
  - `name`: string (required)
  - `email`: string (optional)
  - `description`: string (optional)
  - `createdAt`: Date
  - `updatedAt`: Date

### Project
- **Collection**: `projects`
- **Fields**:
  - `id`: string (auto-generated)
  - `clientId`: string (required, references clients.id)
  - `name`: string (required)
  - `description`: string (optional)
  - `status`: "active" | "inactive" | "completed"
  - `createdAt`: Date
  - `updatedAt`: Date

### Survey
- **Collection**: `surveys`
- **Fields**:
  - `id`: string (auto-generated)
  - `projectId`: string (required, references projects.id)
  - `name`: string (required)
  - `type`: "client-project" | "event-feedback"
  - `description`: string
  - `questions`: Question[]
  - `isActive`: boolean
  - `shareLink`: string (auto-generated UUID)
  - `status`: "DRAFT" | "ACTIVE" | "COMPLETED"
  - `createdAt`: Date
  - `updatedAt`: Date

### Response
- **Collection**: `responses`
- **Fields**:
  - `id`: string (auto-generated)
  - `surveyId`: string (required, references surveys.id)
  - `surveyName`: string
  - `surveyType`: string
  - `data`: Record<string, any>
  - `sentiment`: "positive" | "neutral" | "negative" (optional)
  - `aiInsights`: string (optional)
  - `submittedAt`: Date

## API Endpoints

### Organizations
- `GET /api/organizations` - Get all organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/[id]` - Get organization by ID
- `PUT /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

### Clients
- `GET /api/clients?organizationId=[id]` - Get clients (optionally filtered by organization)
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client by ID
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Projects
- `GET /api/projects?clientId=[id]` - Get projects (optionally filtered by client)
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project by ID
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Surveys
- `GET /api/surveys?projectId=[id]` - Get surveys (optionally filtered by project)
- `POST /api/surveys` - Create survey
- `GET /api/surveys/[id]` - Get survey by ID
- `PUT /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey

## Usage Examples

### Creating the Full Hierarchy

```typescript
// 1. Create Organization
const org = await apiClient.organizations.create({
  name: "Acme Corp",
  description: "A sample organization"
})

// 2. Create Client
const client = await apiClient.clients.create({
  organizationId: org.id,
  name: "Beta Client",
  email: "contact@betaclient.com"
})

// 3. Create Project
const project = await apiClient.projects.create({
  clientId: client.id,
  name: "Website Redesign",
  status: "active"
})

// 4. Create Survey
const survey = await apiClient.surveys.create({
  projectId: project.id,
  name: "User Experience Survey",
  type: "client-project",
  questions: [...]
})
```

### Querying the Hierarchy

```typescript
// Get all clients for an organization
const clients = await apiClient.clients.getAll(organizationId)

// Get all projects for a client
const projects = await apiClient.projects.getAll(clientId)

// Get all surveys for a project
const surveys = await apiClient.surveys.getAll(projectId)
```

## Firebase Security Rules

For production, you should implement Firestore security rules to ensure proper access control:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Organizations - only authenticated users can read/write
    match /organizations/{orgId} {
      allow read, write: if request.auth != null;
    }
    
    // Clients - only authenticated users can read/write
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Projects - only authenticated users can read/write
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    
    // Surveys - authenticated users can read/write, public can read if active
    match /surveys/{surveyId} {
      allow read: if request.auth != null || resource.data.isActive == true;
      allow write: if request.auth != null;
    }
    
    // Responses - public can write, authenticated users can read
    match /responses/{responseId} {
      allow read: if request.auth != null;
      allow write: if true; // Allow public responses
    }
  }
}
```

## Migration Notes

If you're migrating from the previous flat structure:

1. **Existing Projects**: You'll need to assign them to clients
2. **Existing Surveys**: They should already have projectId relationships
3. **Data Migration**: Consider creating a migration script to:
   - Create a default organization
   - Create a default client
   - Assign existing projects to the default client

## Testing

Use the test script to verify the hierarchy:

```bash
# Run the hierarchy test
npx tsx scripts/test-hierarchy.ts
```

This will create a complete Organization > Client > Project > Survey hierarchy and verify all relationships work correctly.

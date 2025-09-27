// Test script to verify the Organization > Client > Project > Survey hierarchy
// This can be run in the browser console or as a Node.js script

import { apiClient } from '../lib/api-client'

async function testHierarchy() {
  console.log('🧪 Testing Organization > Client > Project > Survey hierarchy...')
  
  try {
    // 1. Create an Organization
    console.log('\n1️⃣ Creating Organization...')
    const organization = await apiClient.organizations.create({
      name: 'Test Organization',
      description: 'A test organization for hierarchy validation'
    })
    console.log('✅ Organization created:', organization)

    // 2. Create a Client under the Organization
    console.log('\n2️⃣ Creating Client...')
    const client = await apiClient.clients.create({
      organizationId: organization.id,
      name: 'Test Client',
      email: 'test@client.com',
      description: 'A test client under the organization'
    })
    console.log('✅ Client created:', client)

    // 3. Create a Project under the Client
    console.log('\n3️⃣ Creating Project...')
    const project = await apiClient.projects.create({
      clientId: client.id,
      name: 'Test Project',
      description: 'A test project under the client',
      status: 'active'
    })
    console.log('✅ Project created:', project)

    // 4. Create a Survey under the Project
    console.log('\n4️⃣ Creating Survey...')
    const survey = await apiClient.surveys.create({
      projectId: project.id,
      name: 'Test Survey',
      type: 'client-project',
      description: 'A test survey under the project',
      questions: [
        {
          id: '1',
          type: 'text',
          text: 'What is your feedback?',
          required: true,
          order: 1
        }
      ],
      isActive: true
    })
    console.log('✅ Survey created:', survey)

    // 5. Verify the hierarchy by fetching data
    console.log('\n5️⃣ Verifying hierarchy...')
    
    // Fetch clients for the organization
    const clients = await apiClient.clients.getAll(organization.id)
    console.log('📋 Clients in organization:', clients.length)
    
    // Fetch projects for the client
    const projects = await apiClient.projects.getAll(client.id)
    console.log('📋 Projects in client:', projects.length)
    
    // Fetch surveys for the project
    const surveys = await apiClient.surveys.getAll(project.id)
    console.log('📋 Surveys in project:', surveys.length)

    console.log('\n🎉 Hierarchy test completed successfully!')
    console.log('📊 Summary:')
    console.log(`   Organization: ${organization.name}`)
    console.log(`   Client: ${client.name}`)
    console.log(`   Project: ${project.name}`)
    console.log(`   Survey: ${survey.name}`)

    return {
      organization,
      client,
      project,
      survey
    }

  } catch (error) {
    console.error('❌ Hierarchy test failed:', error)
    throw error
  }
}

// Export for use in other files
export { testHierarchy }

// If running directly, execute the test
if (typeof window === 'undefined') {
  testHierarchy().catch(console.error)
}

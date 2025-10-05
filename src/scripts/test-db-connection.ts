#!/usr/bin/env tsx

/**
 * Test script to verify database connection and prepared statement handling
 */

import { testDatabaseConnection, createRoomWithRawSQL, roomExistsWithRawSQL, cleanupDatabase } from '../lib/db-utils'

async function runDatabaseTests() {
  console.log('🧪 Starting database connection tests...')
  console.log('=' .repeat(50))

  try {
    // Test 1: Basic connection test
    console.log('\n📋 Test 1: Basic database connection')
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest) {
      throw new Error('Basic connection test failed')
    }

    // Test 2: Room creation (multiple times to test prepared statement handling)
    console.log('\n📋 Test 2: Room creation with prepared statement handling')
    const testRooms: string[] = []
    
    for (let i = 0; i < 3; i++) {
      const roomId = `TEST${1000 + i}`
      console.log(`Creating test room: ${roomId}`)
      
      try {
        const room = await createRoomWithRawSQL(roomId)
        testRooms.push(room.roomId)
        console.log(`✅ Room ${roomId} created successfully`)
      } catch (error) {
        console.error(`❌ Failed to create room ${roomId}:`, error)
        throw error
      }
    }

    // Test 3: Room existence checks
    console.log('\n📋 Test 3: Room existence checks')
    for (const roomId of testRooms) {
      const exists = await roomExistsWithRawSQL(roomId)
      if (!exists) {
        throw new Error(`Room ${roomId} should exist but doesn't`)
      }
      console.log(`✅ Room ${roomId} exists`)
    }

    // Test 4: Non-existent room check
    console.log('\n📋 Test 4: Non-existent room check')
    const nonExistentExists = await roomExistsWithRawSQL('FAKE')
    if (nonExistentExists) {
      throw new Error('Non-existent room should not exist')
    }
    console.log('✅ Non-existent room correctly returns false')

    console.log('\n🎉 All database tests passed!')
    console.log('✅ Prepared statement conflicts have been resolved')
    
  } catch (error) {
    console.error('\n❌ Database tests failed:', error)
    process.exit(1)
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data and connections...')
    await cleanupDatabase()
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runDatabaseTests()
    .then(() => {
      console.log('\n✅ Test script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error)
      process.exit(1)
    })
}

export { runDatabaseTests }

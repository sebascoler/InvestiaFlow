#!/usr/bin/env node

/**
 * Migration script to create teams for existing users
 * 
 * This script:
 * 1. Finds all unique userIds from leads, documents, and automation rules
 * 2. Creates a team for each user
 * 3. Adds the user as owner of their team
 * 4. Updates all existing data to include teamId
 * 
 * Usage: node scripts/migrate-users-to-teams.js
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
try {
  const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'investiaflow',
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.error('Make sure serviceAccountKey.json exists in the project root');
  process.exit(1);
}

const db = admin.firestore();

async function migrateUsersToTeams() {
  console.log('🚀 Starting migration: Users to Teams...\n');

  try {
    // Step 1: Get all unique userIds
    console.log('Step 1: Finding all unique users...');
    const userIds = new Set();

    // Get userIds from leads
    const leadsSnapshot = await db.collection('leads').get();
    leadsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) userIds.add(data.userId);
    });
    console.log(`  Found ${leadsSnapshot.size} leads`);

    // Get userIds from documents
    const documentsSnapshot = await db.collection('documents').get();
    documentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) userIds.add(data.userId);
    });
    console.log(`  Found ${documentsSnapshot.size} documents`);

    // Get userIds from automation rules
    const rulesSnapshot = await db.collection('automationRules').get();
    rulesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) userIds.add(data.userId);
    });
    console.log(`  Found ${rulesSnapshot.size} automation rules`);

    console.log(`  Total unique users: ${userIds.size}\n`);

    // Step 2: Create teams for each user
    console.log('Step 2: Creating teams for each user...');
    const userTeamMap = new Map();

    for (const userId of userIds) {
      try {
        // Check if team already exists for this user
        const existingTeamsSnapshot = await db.collection('teams')
          .where('ownerId', '==', userId)
          .limit(1)
          .get();

        if (!existingTeamsSnapshot.empty) {
          const existingTeam = existingTeamsSnapshot.docs[0];
          userTeamMap.set(userId, existingTeam.id);
          console.log(`  User ${userId} already has team: ${existingTeam.id}`);
          continue;
        }

        // Create team
        const teamRef = db.collection('teams').doc();
        const now = admin.firestore.Timestamp.now();
        
        await teamRef.set({
          name: `Team ${userId.substring(0, 8)}`,
          ownerId: userId,
          createdAt: now,
          updatedAt: now,
        });

        // Add user as owner member
        const memberRef = db.collection('teamMembers').doc();
        await memberRef.set({
          teamId: teamRef.id,
          userId: userId,
          email: '', // Will be updated from user profile
          name: '', // Will be updated from user profile
          role: 'owner',
          invitedBy: userId,
          joinedAt: now,
          status: 'active',
        });

        userTeamMap.set(userId, teamRef.id);
        console.log(`  Created team ${teamRef.id} for user ${userId}`);
      } catch (error) {
        console.error(`  Error creating team for user ${userId}:`, error);
      }
    }

    console.log(`\n  Created/Found ${userTeamMap.size} teams\n`);

    // Step 3: Update all documents with teamId
    console.log('Step 3: Updating leads with teamId...');
    let leadsUpdated = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of leadsSnapshot.docs) {
      const data = doc.data();
      const teamId = userTeamMap.get(data.userId);
      
      if (teamId && !data.teamId) {
        batch.update(doc.ref, { teamId });
        leadsUpdated++;
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
    console.log(`  Updated ${leadsUpdated} leads\n`);

    console.log('Step 4: Updating documents with teamId...');
    let docsUpdated = 0;
    const docBatch = db.batch();
    let docBatchCount = 0;

    for (const doc of documentsSnapshot.docs) {
      const data = doc.data();
      const teamId = userTeamMap.get(data.userId);
      
      if (teamId && !data.teamId) {
        docBatch.update(doc.ref, { teamId });
        docsUpdated++;
        docBatchCount++;

        if (docBatchCount >= 500) {
          await docBatch.commit();
          docBatchCount = 0;
        }
      }
    }

    if (docBatchCount > 0) {
      await docBatch.commit();
    }
    console.log(`  Updated ${docsUpdated} documents\n`);

    console.log('Step 5: Updating automation rules with teamId...');
    let rulesUpdated = 0;
    const ruleBatch = db.batch();
    let ruleBatchCount = 0;

    for (const doc of rulesSnapshot.docs) {
      const data = doc.data();
      const teamId = userTeamMap.get(data.userId);
      
      if (teamId && !data.teamId) {
        ruleBatch.update(doc.ref, { teamId });
        rulesUpdated++;
        ruleBatchCount++;

        if (ruleBatchCount >= 500) {
          await ruleBatch.commit();
          ruleBatchCount = 0;
        }
      }
    }

    if (ruleBatchCount > 0) {
      await ruleBatch.commit();
    }
    console.log(`  Updated ${rulesUpdated} automation rules\n`);

    console.log('✅ Migration completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Teams created/found: ${userTeamMap.size}`);
    console.log(`  - Leads updated: ${leadsUpdated}`);
    console.log(`  - Documents updated: ${docsUpdated}`);
    console.log(`  - Automation rules updated: ${rulesUpdated}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateUsersToTeams()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

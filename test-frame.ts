import { db } from './config/db';
import { frameTable } from './config/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const targetFrameId = '4cc237b9-1686-4a01-871d-7bf18a5b7326';
  console.log(`[Test] Querying frameTable for frameId: ${targetFrameId}`);
  try {
    const frameResult = await db
      .select()
      .from(frameTable)
      .where(eq(frameTable.frameId, targetFrameId));
    console.log('Result:', frameResult);
  } catch (error) {
    console.error('Failed to query frame:', error);
  }
}

main();

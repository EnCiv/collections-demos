/* 
 * Demo 3: Aggregation with Lookup
 * 
 * This demo shows how to:
 * - Store related documents with parent references
 * - Use MongoDB aggregation pipeline
 * - Use $lookup to join related documents in one query
 * - Demonstrate efficient data retrieval in a single round trip
 * - Extract timestamps from MongoDB ObjectIds
 */

const { Mongo, Collection } = require('@enciv/mongo-collections');
const readline = require('readline');
require('dotenv').config();

/*
 * Define the Forms collection
 * - Stores both parent entries (firstName, favoriteFruit) and friend entries (friendName, parentId)
 * - Friends could be a separate collection, but Mongo is flexible and this keeps the demo simple
 */
class Forms extends Collection {
  static collectionName = 'forms-aggregate'
}

// Initialize collection properties
Forms.setCollectionProps();

async function main() {
  try {
    console.log('Welcome to the Aggregation Demo!\n');

    /*
     * Connect to MongoDB using the URI from environment variables
     */
    await Mongo.connect(process.env.MONGO_DB_URI);

    /*
     * Get user input for main entry
     */
    const firstName = await prompt('First Name: ');
    const favoriteFruit = await prompt('Favorite Fruit: ');

    /*
     * Create a new form entry - MongoDB auto-generates _id with embedded timestamp
     */
    const entry = {
      firstName,
      favoriteFruit
    };

    /*
     * Save the entry to the Forms collection
     */
    const result = await Forms.insertOne(entry);
    const parentId = result.insertedId;
    console.log('\nEntry saved!\n');

    /*
     * Collect friends - keep asking until user enters empty string
     */
    console.log('Enter friends (press Enter without typing to finish):');
    let friendCount = 0;
    while (true) {
      const friendName = await prompt(`Friend ${friendCount + 1}: `);
      if (friendName === '') break;
      
      // Save each friend as a separate document with parentId reference
      await Forms.insertOne({
        friendName,
        parentId
      });
      friendCount++;
    }

    if (friendCount > 0) {
      console.log(`\n${friendCount} friend(s) added!\n`);
    }

    /*
     * Use aggregation pipeline to get all entries with their friends in one query
     * This demonstrates MongoDB's power to join related data in a single round trip
     */
    const allEntries = await Forms.aggregate([
      // Only match documents that have firstName (parent entries)
      { $match: { firstName: { $exists: true } } },
      
      // Lookup (join) friend documents using parentId
      { 
        $lookup: {
          from: 'forms-aggregate',
          localField: '_id',
          foreignField: 'parentId',
          as: 'friendDocs'
        }
      },
      
      // Project to shape the output - extract just friend names
      {
        $project: {
          firstName: 1,
          favoriteFruit: 1,
          friends: '$friendDocs.friendName',
          _id: 1
        }
      }
    ]).toArray();

    /*
     * Display all entries with their friends
     */
    console.log('All entries in the collection (with friends joined):');
    allEntries.forEach((doc, index) => {
      console.log(`${index + 1}. ${JSON.stringify(doc)}`);
    });

    /*
     * Display all raw documents to show the underlying data structure
     */
    console.log('\nAll raw documents in the collection (before aggregation):');
    const allDocs = await Forms.find({}).toArray();
    allDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${JSON.stringify(doc)}`);
    });

    console.log('\nNote: All data retrieved in a single aggregation query using $lookup');
    console.log('Note: Each friend is stored as a separate document with a parentId reference\n');

  } catch (error) {
    console.error('\nError:', error.message);
    rl.close();
    await Mongo.client.close();
    process.exit(1);
  } finally {
    /*
     * Clean up and close connections
     */
    rl.close();
    await Mongo.client.close();
    process.exit(0);
  }
}

main();

/*
* Okay, Its bad form but I moved these below to focus on the main logic
*/

/*
 * Create readline interface for getting user input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/*
 * Helper function to prompt user and get their response
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

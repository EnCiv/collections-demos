/* 
 * Demo 4: Aggregation with Separate Collections and Schemas
 * 
 * This demo shows how to:
 * - Define multiple collections with their own schemas
 * - Store related data in separate collections
 * - Use MongoDB aggregation pipeline with $lookup across collections
 * - Enforce data validation on both collections
 * - Demonstrate efficient cross-collection queries
 */

const { Mongo, Collection } = require('@enciv/mongo-collections');
const readline = require('readline');
require('dotenv').config();

/*
 * Define the Forms collection with schema validation
 */
class Forms extends Collection {
  static collectionName = 'forms-with-friends'
  static collectionOptions = {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Form Object Validation',
        required: ['firstName', 'favoriteFruit'],
        properties: {
          firstName: {
            bsonType: 'string',
            description: "'firstName' must be a string and is required",
          },
          favoriteFruit: {
            bsonType: 'string',
            description: "'favoriteFruit' must be a string and is required",
          },
        },
      },
    },
  }
}

// Initialize collection properties
Forms.setCollectionProps();
/*
 * Define the Friends collection with schema validation
 */
class Friends extends Collection {
  static collectionName = 'friends'
  static collectionOptions = {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Friend Object Validation',
        required: ['friendName', 'parentId'],
        properties: {
          friendName: {
            bsonType: 'string',
            description: "'friendName' must be a string and is required",
          },
          parentId: {
            bsonType: 'objectId',
            description: "'parentId' must be an objectId and is required",
          },
        },
      },
    },
  }
}

// Initialize collection properties
Friends.setCollectionProps();

async function main() {
  try {
    console.log('Welcome to the Multi-Collection Aggregation Demo!\n');

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
      
      /*
       * Save each friend to the Friends collection with parentId reference
       * Schema validation ensures friendName is a string and parentId is an ObjectId
       */
      await Friends.insertOne({
        friendName,
        parentId
      });
      friendCount++;
    }

    if (friendCount > 0) {
      console.log(`\n${friendCount} friend(s) added!\n`);
    }

    /*
     * Use aggregation pipeline to join Forms with Friends in one query
     * This demonstrates cross-collection aggregation
     */
    const allEntries = await Forms.aggregate([
      // Lookup (join) friend documents from the Friends collection
      { 
        $lookup: {
          from: 'friends',
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
    console.log('All entries with friends (from aggregation across collections):');
    allEntries.forEach((doc, index) => {
      console.log(`${index + 1}. ${JSON.stringify(doc)}`);
    });

    /*
     * Display all raw documents to show the underlying data structure
     */
    console.log('\nAll documents in Forms collection:');
    const allForms = await Forms.find({}).toArray();
    allForms.forEach((doc, index) => {
      console.log(`${index + 1}. ${JSON.stringify(doc)}`);
    });

    console.log('\nAll documents in Friends collection:');
    const allFriends = await Friends.find({}).toArray();
    allFriends.forEach((doc, index) => {
      console.log(`${index + 1}. ${JSON.stringify(doc)}`);
    });

    console.log('\nNote: Data stored in two separate collections with their own schemas');
    console.log('Note: Aggregation joins them in a single query using $lookup\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.code === 121) {
      console.error('\n--- Schema Validation Failed ---');
      console.error('Check that all required fields have the correct types.\n');
      
      // Display detailed validation error information
      if (error.errInfo && error.errInfo.details) {
        console.error('Validation Details:');
        console.error(JSON.stringify(error.errInfo.details, null, 2));
      }
    }
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
* Okay, it's bad form but I moved these below to focus on the main logic
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

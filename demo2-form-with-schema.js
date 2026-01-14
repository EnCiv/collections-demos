/* 
 * Demo 2: Form Collection with Schema Validation
 * 
 * This demo shows how to:
 * - Define a collection with MongoDB schema validation
 * - Use collectionOptions to enforce data rules
 * - Collect user input via console
 * - Save validated data to the collection
 * - Handle validation errors gracefully
 * - Extract timestamps from MongoDB ObjectIds
 */

const { Mongo, Collection } = require('@enciv/mongo-collections');
const readline = require('readline');
require('dotenv').config();

/*
 * Define the Forms collection with schema validation
 * - Schema ensures firstName and favoriteFruit are required strings
 */
class Forms extends Collection {
  static collectionName = 'forms-validated'
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

async function main() {
  try {
    console.log('Welcome to the Form Collection Demo with Schema Validation!\n');

    /*
     * Connect to MongoDB using the URI from environment variables
     */
    await Mongo.connect(process.env.MONGO_DB_URI);

    /*
     * Get user input
     */
    const firstName = await prompt('First Name: ');
    const favoriteFruit = await prompt('Favorite Fruit: ');

    /*
     * Create a new form entry - MongoDB auto-generates _id with embedded timestamp
     * Schema validation will ensure both fields are non-empty strings
     */
    const entry = {
      firstName,
      favoriteFruit
    };

    /*
     * Save the entry to the Forms collection
     * MongoDB will validate the entry against the schema before inserting
     */
    const result = await Forms.insertOne(entry);
    console.log('\nEntry saved and validated!\n');

    /*
     * Query all documents from the Forms collection
     */
    const allEntries = await Forms.find({}).toArray();

    /*
     * Display all entries
     */
    console.log('All entries in the collection:');
    allEntries.forEach((doc, index) => {
      // Extract timestamp from MongoDB ObjectId
      const createdAt = doc._id.getTimestamp().toISOString();
      console.log(`${index + 1}. firstName: ${doc.firstName}, favoriteFruit: ${doc.favoriteFruit}, created: ${createdAt}`);
    });

    console.log('\nNote: The \'created\' timestamp is extracted from the MongoDB ObjectId');
    console.log('Note: All entries were validated against the schema before insertion\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.code === 121) {
      console.error('\n--- Schema Validation Failed ---');
      
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
 * Returns null if user just hits Enter (to demonstrate schema validation)
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer === '' ? null : answer);
    });
  });
}

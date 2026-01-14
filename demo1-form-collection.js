/* 
 * Demo 1: Form Collection with User Input
 * 
 * This demo shows how to:
 * - Connect to MongoDB using @enciv/mongo-collections
 * - Define a collection using the Collection class
 * - Collect user input via console
 * - Save data to a collection
 * - Query and display all entries
 * - Extract timestamps from MongoDB ObjectIds
 */

const { Mongo, Collection } = require('@enciv/mongo-collections');
const readline = require('readline');
require('dotenv').config();

/*
 * Define the Forms collection by extending Collection
 * - Usually this would be in a file like models/forms.js that would be imported
 */
class Forms extends Collection {
  static collectionName = 'forms'
}

// Important - Initialize collection properties
Forms.setCollectionProps();

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

async function main() {
  try {
    console.log('Welcome to the Form Collection Demo!\n');

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
     */
    const entry = {
      firstName,
      favoriteFruit
    };

    /*
     * Save the entry to the Forms collection
     */
    const result = await Forms.insertOne(entry);
    console.log('\nEntry saved!\n');

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

    console.log('\nNote: The \'created\' timestamp is extracted from the MongoDB ObjectId\n');

  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
    Mongo.disconnect()
    process.exit(1);
  } finally {
    /*
     * Clean up and close connections
     */
    rl.close();
    Mongo.disconnect()
    process.exit(0);
  }
}

main();

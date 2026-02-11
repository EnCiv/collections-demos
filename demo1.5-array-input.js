/* 
 * Demo 1.5: Form Collection with Array Input
 * 
 * This demo shows how to:
 * - Connect to MongoDB using @enciv/mongo-collections
 * - Define a collection using the Collection class
 * - Collect user input via console, including multiple values in an array
 * - Save data with array fields to a collection
 * - Query and display all entries
 * - Extract timestamps from MongoDB ObjectIds
 */

const { Mongo, Collection } = require('@enciv/mongo-collections');
const readline = require('readline');
require('dotenv').config();

/*
 * Define the Forms collection by extending Collection
 * - Usually this would be in a file like models/forms.js that would be imported
 * - Uses the same 'forms' collection as demo1
 */
class Forms extends Collection {
  static collectionName = 'forms'
}

// Important - Initialize collection properties
Forms.setCollectionProps();

async function main() {
  try {
    console.log('Welcome to the Form Collection Demo with Array Input!\n');

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
     * Collect favorite vegetables as an array
     * Keep prompting until user enters a blank line
     */
    const favoriteVegies = [];
    console.log('\nEnter your favorite vegetables (press Enter with no input to finish):');
    
    let vegieCount = 1;
    while (true) {
      const vegie = await prompt(`  Vegetable ${vegieCount}: `);
      if (vegie === '') {
        break;
      }
      favoriteVegies.push(vegie);
      vegieCount++;
    }

    /*
     * Create a new form entry - MongoDB auto-generates _id with embedded timestamp
     */
    const entry = {
      firstName,
      favoriteFruit,
      favoriteVegies
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
      console.log(`${index + 1}. ${JSON.stringify(doc)}, created: ${createdAt}`);
    });

    console.log('\nNote: The \'created\' timestamp is extracted from the MongoDB ObjectId');
    console.log('Note: favoriteVegies is stored as an array in MongoDB\n');

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

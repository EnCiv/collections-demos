# Collections Demo

Educational demos showcasing MongoDB integration with JavaScript using [@enciv/mongo-collections](https://www.npmjs.com/package/@enciv/mongo-collections).

## Prerequisites

- **Node.js**: Version 22.21.1 (specified in `.nvmrc` file - automatically loaded in compatible environments)
- **MongoDB**: Either:
  - Local MongoDB installation, OR
  - MongoDB Atlas account (free tier available at [mongodb.com](https://www.mongodb.com/))

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@enciv/mongo-collections` - Simplified MongoDB collections wrapper
- `dotenv` - Environment variable management

### 2. Configure MongoDB Connection

Create a `.env` file in the project root (use `.env.example` as a template):

**For local MongoDB:**
```
MONGO_DB_URI=mongodb://localhost:27017/collections-demo
```

**For MongoDB Atlas:**
```
MONGO_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/collections-demo
```

Replace `<username>`, `<password>`, and `<cluster>` with your actual MongoDB Atlas credentials.

### 3. Initialize Git (Optional)

```bash
git init
git add .
git commit -m "Initial commit: collections-demo project"
```

## Demos

### Demo 1: Form Collection with User Input

**File:** `demo1-form-collection.js`

This demo demonstrates:
- Connecting to MongoDB
- Collecting user input via console
- Saving data to a collection
- Querying all entries
- Extracting timestamps from MongoDB ObjectIds

**Run the demo:**

```bash
node demo1-form-collection.js
```

Or use the npm script:

```bash
npm run demo1
```

**Example output:**

```
Welcome to the Form Collection Demo!

First Name: John
Favorite Fruit: apples

Entry saved!

All entries in the collection:
1. firstName: John, favoriteFruit: apples, created: 2026-01-13T10:30:45.123Z
2. firstName: Jane, favoriteFruit: oranges, created: 2026-01-13T10:32:18.456Z

Note: The 'created' timestamp is extracted from the MongoDB ObjectId
```

**How it works:**
- Prompts for first name and favorite fruit via stdin
- Saves each entry to the `forms` collection
- MongoDB automatically generates an `_id` (ObjectId) with embedded timestamp
- Displays all entries with timestamps extracted from their ObjectIds
- Data persists between runs

### Demo 2: Form Collection with Schema Validation

**File:** `demo2-form-with-schema.js`

This demo demonstrates:
- Defining a collection with MongoDB schema validation
- Using `collectionOptions` to enforce data rules
- Handling validation errors
- Ensuring data integrity at the database level

**Run the demo:**

```bash
node demo2-form-with-schema.js
```

Or use the npm script:

```bash
npm run demo2
```

**What's different from Demo 1:**
- Uses a separate collection (`forms-validated`) with schema validation
- MongoDB enforces that `firstName` and `favoriteFruit` must be strings and are required
- Invalid data will be rejected before insertion
- Shows how to handle validation errors (error code 121)

**Key code difference:**
```javascript
class Forms extends Collection {
  static collectionName = 'forms-validated'
  static collectionOptions = {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['firstName', 'favoriteFruit'],
        properties: {
          firstName: { bsonType: 'string' },
          favoriteFruit: { bsonType: 'string' }
        }
      }
    }
  }
}
```

### Demo 3: Aggregation with Lookup

**File:** `demo3-aggregation-lookup.js`

This demo demonstrates:
- Storing related documents with parent references
- Using MongoDB aggregation pipeline
- Using `$lookup` to join related documents
- Retrieving all related data in a single round trip to the database

**Run the demo:**

```bash
node demo3-aggregation-lookup.js
```

Or use the npm script:

```bash
npm run demo3
```

**Example interaction:**

```
Welcome to the Aggregation Demo!

First Name: Alice
Favorite Fruit: bananas

Entry saved!

Enter friends (press Enter without typing to finish):
Friend 1: Bob
Friend 2: Charlie
Friend 3: Diana
Friend 4: 

3 friend(s) added!

All entries in the collection (with friends joined):
1. firstName: Alice, favoriteFruit: bananas, friends: [Bob, Charlie, Diana], created: 2026-01-13T10:45:23.456Z

Note: All data retrieved in a single aggregation query using $lookup
Note: Each friend is stored as a separate document with a parentId reference
```

**How it works:**
- Creates a main entry with `firstName` and `favoriteFruit`
- Prompts for friends repeatedly until user hits Enter
- Each friend is stored as a separate document with `friendName` and `parentId`
- Uses aggregation pipeline with `$lookup` to join friends with their parent in one query
- Demonstrates efficient data retrieval - all related data in a single round trip

**Key aggregation pipeline:**
```javascript
Forms.aggregate([
  { $match: { firstName: { $exists: true } } },
  { 
    $lookup: {
      from: 'forms-aggregate',
      localField: '_id',
      foreignField: 'parentId',
      as: 'friendDocs'
    }
  },
  { $project: { friends: '$friendDocs.friendName' } }
])
```

### Demo 4: Separate Collections with Schemas and Aggregation

**File:** `demo4-separate-collections.js`

This demo demonstrates:
- Defining multiple collections with their own schema validation
- Storing related data in separate collections (Forms and Friends)
- Using `$lookup` to join data across different collections
- Schema validation on both collections
- Best practice: separating concerns into different collections

**Run the demo:**

```bash
node demo4-separate-collections.js
```

Or use the npm script:

```bash
npm run demo4
```

**What's different from Demo 3:**
- Friends stored in a separate `Friends` collection (not mixed with Forms)
- Both collections have schema validation
- Forms schema requires `firstName` and `favoriteFruit` as strings
- Friends schema requires `friendName` (string) and `parentId` (ObjectId)
- Shows proper data modeling with separate collections

**Key collection definitions:**
```javascript
class Forms extends Collection {
  static collectionName = 'forms-with-friends'
  static collectionOptions = {
    validator: { $jsonSchema: { /* ... */ } }
  }
}

class Friends extends Collection {
  static collectionName = 'friends'
  static collectionOptions = {
    validator: {
      $jsonSchema: {
        required: ['friendName', 'parentId'],
        properties: {
          friendName: { bsonType: 'string' },
          parentId: { bsonType: 'objectId' }
        }
      }
    }
  }
}
```

**Aggregation across collections:**
```javascript
Forms.aggregate([
  { 
    $lookup: {
      from: 'friends',  // Join with Friends collection
      localField: '_id',
      foreignField: 'parentId',
      as: 'friendDocs'
    }
  }
])
```

## Key Concepts Demonstrated

### MongoDB ObjectId Timestamps
MongoDB's ObjectId contains a timestamp of when the document was created. This demo shows how to extract it using `_id.getTimestamp()`, eliminating the need for separate timestamp fields.

### @enciv/mongo-collections Pattern
The library provides a simple connection pattern:
```javascript
const { Mongo } = require('@enciv/mongo-collections');
await Mongo.connect(process.env.MONGO_DB_URI);
const collection = Mongo.db.collection('collectionName');
```

This creates a single connection that can be used throughout your project.

## Troubleshooting

**"Cannot connect to MongoDB"**
- Verify your `MONGO_DB_URI` in the `.env` file
- For local MongoDB, ensure the MongoDB service is running
- For Atlas, check your network access settings and credentials

**"Module not found"**
- Run `npm install` to install dependencies

**Node.js version issues**
- Check you're using Node.js 22.21.1 (see `.nvmrc`)
- If using nvm: `nvm use`

## Future Demos

Additional demos will cover:
- Query and filter operations
- Updating existing entries
- Delete operations
- Indexing and performance
- Aggregation pipelines

## License

MIT

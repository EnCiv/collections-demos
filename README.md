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

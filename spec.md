# @enciv/mongo-collections Demo Project Specification

## Project Overview
Create a series of simple, educational demos showcasing how MongoDB integrates seamlessly with JavaScript, and how `@enciv/mongo-collections` makes it even easier. Target audience includes both experienced and newer JavaScript developers.

## Project Setup

### 1. Initialize npm project
```bash
npm init -y
```

### 2. Install dependencies
```bash
npm install @enciv/mongo-collections
```

### 3. Initialize git repository
```bash
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
git add .
git commit -m "Initial commit: setup collections-demo project"
```

### 4. Create .env.example file
Create a template file showing what environment variables are needed:
```
MONGO_DB_URI=mongodb://localhost:27017/collections-demo
```

## Demo 1: Form Collection with User Input

### File: `demo1-form-collection.js`

**Purpose:** Demonstrate basic CRUD operations with user input via stdin.

**Functionality:**
1. Import the mongo-collections module
2. Create/access a "forms" collection
3. Prompt user via console for:
   - First name
   - Favorite fruit
4. Save the entry to the collection with:
   - firstName field
   - favoriteFruit field
   - (MongoDB will auto-generate the _id ObjectId)
5. Retrieve all entries from the collection
6. Display all entries, one per line, in a readable format
7. Close the database connection

**Requirements:**
- Use `readline` or similar for stdin input
- Simple, clear code structure
- Light markdown-style comments explaining each section
- Error handling for database connection
- Graceful shutdown

**Output Format:**
```
Welcome to the Form Collection Demo!
First Name: [user input]
Favorite Fruit: [user input]

Entry saved!

All entries in the collection:
1. firstName: John, favoriteFruit: apples, created: 2026-01-13T10:30:00.000Z
2. firstName: Jane, favoriteFruit: oranges, created: 2026-01-13T10:31:00.000Z
3. firstName: [current entry]

Note: The 'created' timestamp is extracted from the MongoDB ObjectId
```

## Implementation Steps

### Step 1: Setup Project Structure
- [ ] Run `npm init -y` to create package.json
- [ ] Install `@enciv/mongo-collections`
- [ ] Initialize git repository
- [ ] Create .gitignore with node_modules and .env
- [ ] Create .env.example template

### Step 2: Create demo1-form-collection.js
- [ ] Import required modules (mongo-collections, readline)
- [ ] Setup readline interface for stdin
- [ ] Create helper function to prompt for input
- [ ] Connect to MongoDB using MONGO_DB_URI from environment
- [ ] Create/access "forms" collection
- [ ] Implement data collection flow:
  - Prompt for first name
  - Prompt for favorite fruit
  - Save to collection (MongoDB auto-generates ObjectId)
- [ ] Query all documents from collection
- [ ] Extract timestamp from ObjectId for display
- [ ] Display results in readable format (field: value pairs)
- [ ] Close database connection and exit

### Step 3: Create README.md
- [ ] Document how to set MONGO_DB_URI in .env file
- [ ] Mention MongoDB Atlas free tier at https://www.mongodb.com/ (recommended for this demo)
- [ ] Provide instructions to run each demo
- [ ] Include prerequisites (Node.js version from .nvmrc file, MongoDB setup)
- [ ] Show example usage

### Step 4: Test
- [ ] Verify MongoDB connection works
- [ ] Run demo multiple times to confirm data persists
- [ ] Test with different inputs
- [ ] Verify error handling

## Code Style Guidelines

### Comments
- Use `//` for short inline comments
- Use `/* ... */` for multi-line explanatory sections
- Keep comments concise and beginner-friendly
- Focus on *why* not *what* for obvious code

### Code Structure
- Keep functions small and focused
- Use async/await (not callbacks or raw promises)
- Use descriptive variable names
- Separate concerns (input, database operations, output)

### Example Comment Style
```javascript
/* Connect to MongoDB using mongo-collections */
const { Mongo } = require('@enciv/mongo-collections');
await Mongo.connect(process.env.MONGO_DB_URI);

// Access the forms collection directly through Mongo.db
const forms = Mongo.db.collection('forms');

// Create a new form entry (MongoDB auto-generates _id with timestamp)
const entry = {
  firstName: name,
  favoriteFruit: fruit
};

// Insert and then extract timestamp from ObjectId: result.insertedId.getTimestamp()
```

## Environment Setup Notes

Users will need to:

1. Have MongoDB running locally OR have access to a MongoDB Atlas cluster (free tier available at https://www.mongodb.com/)
2. Create a `.env` file in the project root with:
   ```
   MONGO_DB_URI=mongodb://localhost:27017/collections-demo
   ```
   Or for MongoDB Atlas:
   ```
   MONGO_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/collections-demo
   ```
3. Run with: `node demo1-form-collection.js`

## Future Demo Ideas (Not in scope for initial implementation)
- Demo 2: Query and filter operations
- Demo 3: Update existing entries
- Demo 4: Delete operations
- Demo 5: Indexing and performance
- Demo 6: Aggregation pipeline basics

## Success Criteria
- ✓ Code runs without errors when MONGO_DB_URI is set
- ✓ User can input data via console
- ✓ Data persists between runs
- ✓ All entries display correctly
- ✓ Code is simple enough for newer developers to understand
- ✓ Comments explain the mongo-collections usage clearly

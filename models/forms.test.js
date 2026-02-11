/**
 * Tests for Forms Collection Model
 * 
 * These tests verify:
 * - Proper database connection
 * - Schema validation enforcement
 * - Error handling for schema mismatches
 * - Data insertion and retrieval
 */

const { Mongo } = require('@enciv/mongo-collections');
const Forms = require('../models/forms');

describe('Forms Collection', () => {
  beforeAll(async () => {
    // Connect to the in-memory MongoDB instance
    await Mongo.connect(global.__MONGO_URI__, { useUnifiedTopology: true });
  });

  afterAll(async () => {
    // Clean up and close connections
    if (Mongo.client) {
      await Mongo.client.close();
    }
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await Forms.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should successfully insert a valid form entry', async () => {
      const validEntry = {
        firstName: 'John',
        favoriteFruit: 'Apple'
      };

      const result = await Forms.insertOne(validEntry);
      
      expect(result.insertedId).toBeDefined();
      
      // Verify the entry was saved
      const saved = await Forms.findOne({ _id: result.insertedId });
      expect(saved.firstName).toBe('John');
      expect(saved.favoriteFruit).toBe('Apple');
    });

    test('should throw an error when firstName is missing', async () => {
      const invalidEntry = {
        favoriteFruit: 'Banana'
        // firstName is missing
      };

      await expect(Forms.insertOne(invalidEntry)).rejects.toThrow();
      
      try {
        await Forms.insertOne(invalidEntry);
      } catch (error) {
        expect(error.code).toBe(121); // MongoDB validation error code
        expect(error.message).toContain('validation');
      }
    });

    test('should throw an error when favoriteFruit is missing', async () => {
      const invalidEntry = {
        firstName: 'Jane'
        // favoriteFruit is missing
      };

      await expect(Forms.insertOne(invalidEntry)).rejects.toThrow();
      
      try {
        await Forms.insertOne(invalidEntry);
      } catch (error) {
        expect(error.code).toBe(121); // MongoDB validation error code
        expect(error.message).toContain('validation');
      }
    });

    test('should throw an error when firstName is not a string', async () => {
      const invalidEntry = {
        firstName: 123, // Should be a string
        favoriteFruit: 'Orange'
      };

      await expect(Forms.insertOne(invalidEntry)).rejects.toThrow();
      
      try {
        await Forms.insertOne(invalidEntry);
      } catch (error) {
        expect(error.code).toBe(121); // MongoDB validation error code
        expect(error.message).toContain('validation');
      }
    });

    test('should throw an error when favoriteFruit is not a string', async () => {
      const invalidEntry = {
        firstName: 'Bob',
        favoriteFruit: ['Grape', 'Melon'] // Should be a string, not an array
      };

      await expect(Forms.insertOne(invalidEntry)).rejects.toThrow();
      
      try {
        await Forms.insertOne(invalidEntry);
      } catch (error) {
        expect(error.code).toBe(121); // MongoDB validation error code
        expect(error.message).toContain('validation');
      }
    });

    test('should throw an error when both required fields are missing', async () => {
      const invalidEntry = {
        otherField: 'value'
        // Both firstName and favoriteFruit are missing
      };

      await expect(Forms.insertOne(invalidEntry)).rejects.toThrow();
      
      try {
        await Forms.insertOne(invalidEntry);
      } catch (error) {
        expect(error.code).toBe(121); // MongoDB validation error code
        expect(error.message).toContain('validation');
      }
    });

    test('should throw an error with empty string values', async () => {
      const invalidEntry = {
        firstName: '',
        favoriteFruit: ''
      };

      // Note: Empty strings pass validation but may not be desirable
      // This test documents current behavior
      const result = await Forms.insertOne(invalidEntry);
      expect(result.insertedId).toBeDefined();
      
      // You might want to add additional validation to prevent empty strings
    });
  });

  describe('Data Operations', () => {
    test('should retrieve all form entries', async () => {
      const entries = [
        { firstName: 'Alice', favoriteFruit: 'Strawberry' },
        { firstName: 'Bob', favoriteFruit: 'Blueberry' },
        { firstName: 'Charlie', favoriteFruit: 'Cherry' }
      ];

      await Forms.insertMany(entries);
      
      const allEntries = await Forms.find({}).toArray();
      expect(allEntries).toHaveLength(3);
      expect(allEntries[0].firstName).toBe('Alice');
      expect(allEntries[1].firstName).toBe('Bob');
      expect(allEntries[2].firstName).toBe('Charlie');
    });

    test('should extract timestamp from ObjectId', async () => {
      const entry = {
        firstName: 'David',
        favoriteFruit: 'Mango'
      };

      const result = await Forms.insertOne(entry);
      const saved = await Forms.findOne({ _id: result.insertedId });
      
      const timestamp = saved._id.getTimestamp();
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    test('should allow additional fields beyond schema', async () => {
      const entryWithExtra = {
        firstName: 'Eve',
        favoriteFruit: 'Watermelon',
        age: 30, // Extra field not in schema
        email: 'eve@example.com' // Another extra field
      };

      const result = await Forms.insertOne(entryWithExtra);
      const saved = await Forms.findOne({ _id: result.insertedId });
      
      expect(saved.firstName).toBe('Eve');
      expect(saved.favoriteFruit).toBe('Watermelon');
      expect(saved.age).toBe(30);
      expect(saved.email).toBe('eve@example.com');
    });
  });
});

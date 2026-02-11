/* 
 * Forms Collection Model
 * 
 * This module defines the Forms collection with schema validation.
 * - Schema ensures firstName and favoriteFruit are required strings
 * - Enforces data rules at the database level
 */

const { Collection } = require('@enciv/mongo-collections');

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

module.exports = Forms;

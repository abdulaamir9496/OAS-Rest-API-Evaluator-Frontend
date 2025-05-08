import { faker } from '@faker-js/faker';

// Recursively traverses schema and generates appropriate dummy data
export function generateDummyData(schema: any): any {
  if (!schema) return {};
  
  // Handle $ref
  if (schema.$ref) {
    // In a real implementation, we would resolve the reference
    // For this simple version, we'll return an empty object
    return {};
  }
  
  // Handle oneOf, anyOf, allOf
  if (schema.oneOf) return generateDummyData(schema.oneOf[0]);
  if (schema.anyOf) return generateDummyData(schema.anyOf[0]);
  if (schema.allOf) {
    // Combine all schemas in allOf
    return schema.allOf.reduce((acc: any, subSchema: any) => {
      return { ...acc, ...generateDummyData(subSchema) };
    }, {});
  }
  
  // Handle different types
  switch (schema.type) {
    case 'object':
      return generateObjectData(schema);
    case 'array':
      return generateArrayData(schema);
    case 'string':
      return generateStringData(schema);
    case 'number':
    case 'integer':
      return generateNumberData(schema);
    case 'boolean':
      return faker.datatype.boolean();
    case 'null':
      return null;
    default:
      // If type is not specified, try to infer from other properties
      if (schema.properties) return generateObjectData(schema);
      if (schema.items) return generateArrayData(schema);
      
      // Default to an empty object
      return {};
  }
}

function generateObjectData(schema: any): any {
  const result: any = {};
  
  // Use example if provided
  if (schema.example) {
    return schema.example;
  }
  
  // Generate properties based on schema
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
      // Skip if this property is in the required list and it's readonly
      const isReadOnly = propSchema.readOnly === true;
      const isRequired = Array.isArray(schema.required) && schema.required.includes(propName);
      
      if (!(isReadOnly && isRequired)) {
        result[propName] = generateDummyData(propSchema);
      }
    });
  }
  
  return result;
}

function generateArrayData(schema: any): any[] {
  // Use example if provided
  if (schema.example) {
    return schema.example;
  }
  
  const minItems = schema.minItems || 1;
  const maxItems = schema.maxItems || 3;
  const itemCount = Math.min(
    maxItems, 
    Math.max(minItems, Math.floor(Math.random() * 3) + 1)
  );
  
  // Generate array items
  const result = [];
  for (let i = 0; i < itemCount; i++) {
    result.push(generateDummyData(schema.items || {}));
  }
  
  return result;
}

function generateStringData(schema: any): string {
  // Use example, enum, or default if provided
  if (schema.example) return schema.example;
  if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
  if (schema.default) return schema.default;
  
  // Generate based on format
  switch (schema.format) {
    case 'date':
      return faker.date.past().toISOString().split('T')[0];
    case 'date-time':
      return faker.date.past().toISOString();
    case 'email':
      return faker.internet.email();
    case 'hostname':
    case 'uri':
    case 'url':
      return faker.internet.url();
    case 'uuid':
      return faker.string.uuid();
    case 'password':
      return faker.internet.password();
    case 'byte':
      return Buffer.from(faker.lorem.word()).toString('base64');
    case 'binary':
      return faker.lorem.word();
    case 'ipv4':
      return faker.internet.ip();
    case 'ipv6':
      return faker.internet.ipv6();
    default:
      // Handle patterns
      if (schema.pattern) {
        try {
          // Simple pattern handling - just return something that might match
          return faker.lorem.word();
        } catch (e) {
          return faker.lorem.word();
        }
      }
      
      // Default string generation based on minLength/maxLength
      const minLength = schema.minLength || 1;
      const maxLength = schema.maxLength || 50;
      
      if (minLength > 20) {
        return faker.lorem.paragraph().substring(0, maxLength);
      } else {
        return faker.lorem.words().substring(0, maxLength);
      }
  }
}

function generateNumberData(schema: any): number {
  // Use example, enum, or default if provided
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
  if (schema.default !== undefined) return schema.default;
  
  const min = schema.minimum !== undefined ? schema.minimum : 0;
  const max = schema.maximum !== undefined ? schema.maximum : 1000;
  
  if (schema.type === 'integer') {
    return Math.floor(faker.number.int({ min, max }));
  } else {
    return faker.number.float({ min, max, precision: 0.01 });
  }
}
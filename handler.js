'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  // region: 'localhost',
  // endpoint: 'http://localhost:8000'
}); //remove when deploying

module.exports.create = (event) => {
  return new Promise((res, rej) => {
    const data = JSON.parse(event.body);

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: uuid.v1(),
        content: data.content
      }
    };

    dynamoDb.put(params, (error) => {
      if(error) {
        console.error(error);
        return rej({
          statusCode: error.statusCode || 500,
          headers: { 'Content-Type' : 'text/plain' },
          body: 'Could not create the note!',
        });
      }
      res({
        statusCode: 200,
        body: JSON.stringify(params.Item),
      });
    });
  });
};

module.exports.getOne = async (event) => {
  return new Promise((res, rej) => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };

    dynamoDb.get(params, (error, result) => {
      if(error) {
        console.error(error);
        return rej({
          statusCode: error.statusCode || 500,
          headers: { 'Content-Type' : 'text/plain' },
          body: 'Could not fetch the note!',
        })
      }
      res({
        statusCode: 200,
        body: JSON.stringify(result.Item),
      })
    })
  })
};

module.exports.getAll = async () => {
  return new Promise((res, rej) => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
    };

    dynamoDb.scan(params, (error, result) => {
      if(error) {
        console.error(error);
        return rej({
          statusCode: error.statusCode || 500,
          headers: { 'Content-Type' : 'text/plain' },
          body: 'Could not fetch notes!',
        })
      }
      res({
        statusCode: 200,
        body: JSON.stringify(result.Items),
      })
    })
  })
};

module.exports.update = async (event) => {
  return new Promise((res, rej) => {
    const data = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      },
      ExpressionAttributeValues: {
        ':content': data.content
      },
      UpdateExpression: 'SET content = :content',
      ReturnValues: 'ALL_NEW'
    };

    dynamoDb.update(params, (error, result) => {
      if(error) {
        console.error(error);
        return rej({
          statusCode: error.statusCode || 500,
          headers: { 'Content-Type' : 'text/plain' },
          body: 'Could not update the note!',
        })
      }
      res({
        statusCode: 200,
        body: JSON.stringify(result.Attributes)
      })
    })
  })
};

module.exports.delete = async (event) => {
  return new Promise((res, rej) => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };

    dynamoDb.delete(params, (error) => {
      if(error) {
        console.error(error);
        return rej({
          statusCode: error.statusCode || 500,
          headers: { 'Content-Type' : 'text/plain' },
          body: 'Could not delete the note!',
        })
      }
      res({
        statusCode: 200,
        body: JSON.stringify('Removed the note with id: ' + event.pathParameters.id)
      })
    })
  })
};

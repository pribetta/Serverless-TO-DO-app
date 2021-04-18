import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const itemsTable = process.env.TODOITEMS_TABLE
const itemsIndexName = process.env.TODO_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  try{
    const res = await docClient.query({
      TableName: itemsTable,
      IndexName:itemsIndexName,
      KeyConditionExpression: 'todoId=:todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      },
      ScanIndexForward: false
    }).promise()

    if(res.Count<1){
      throw new Error('No such todo item')
    }
    const updatedItem = await docClient.update({
      TableName: itemsTable,
      Key: {
        userId: res.Items[0].userId,
        createdAt: res.Items[0].createdAt
      },
      UpdateExpression: 'set #key1 = :val1, #key2 = :val2, #key3 = :val3',
      ExpressionAttributeNames: {
        '#key1' : 'name',
        '#key2' : 'dueDate',
        '#key3' : 'done'
      },
      ExpressionAttributeValues : {
        ':val1': updatedTodo.name,
        ':val2': updatedTodo.dueDate,
        ':val3': updatedTodo.done
      },
      ReturnValues : "UPDATED_NEW"
    }, (err,data)=> {
      if(err)
        console.log(err)
      else
        console.log(data)
    }).promise()

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(updatedItem)
    }

  }catch(err){
    console.log('update failed ', err)
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: err
    }
  }
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  
}

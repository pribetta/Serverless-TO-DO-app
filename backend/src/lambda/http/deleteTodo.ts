import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const itemsTable = process.env.TODOITEMS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient()
const s3= new AWS.S3()
const bucketName = process.env.ATTACHMENTS_BUCKET
const itemsIndexName = process.env.TODO_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId:string = event.pathParameters.todoId
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

    await docClient.delete({
      TableName: itemsTable,
      Key: {
        userId: res.Items[0].userId,
        createdAt: res.Items[0].createdAt
      }
    }, (err,data) => {
      if(err)
        console.log(err)
      else
        console.log(data)
    }).promise()
    console.log('Delete succeeded')
    await s3.deleteObject({
      Bucket: bucketName,
      Key: todoId
    }, (err,data)=> {
      if(err)
        console.log('couldnt delete from s3 bucket - ',err)
      else
        console.log('deleted successfully - ', data)
    }).promise()

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }catch(err){
    console.log('Unable to delete item - ', err)
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: err
    }
  }
  // TODO: Remove a TODO item by id
  
}

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const itemsTable = process.env.TODOITEMS_TABLE
// const itemsIndex = process.env.TODO_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const authHeader:string = event.headers['Authorization']
  console.log('Get todos, header : ', JSON.stringify(event.headers))
  const words = authHeader.split(' ')
  const token = words[1]
  const userId = parseUserId(token)
  console.log(' user id ', userId, ' token: ', token)
  try{
    const items = await docClient.query({
      TableName: itemsTable,
      KeyConditionExpression : 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items:items.Items
      })
    }
  }catch(err){
    console.log(err)

    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'No To Do items found'
    }
  }
  

}

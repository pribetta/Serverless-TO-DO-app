import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid'
import { TodoItem } from '../../models/TodoItem'
import * as AWS from 'aws-sdk'



const itemsTable = process.env.TODOITEMS_TABLE
const bucketName = process.env.ATTACHMENTS_BUCKET

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const authHeader:string = event.headers['Authorization']
  const words = authHeader.split(' ')
  const token = words[1]
  const userId = parseUserId(token)
  const todoId = uuid.v4()
  const preUrl = getUploadUrl(todoId)
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }

  await docClient.put({
    TableName: itemsTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem,
      uploadUrl: preUrl
    })
  }
}

function getUploadUrl(todoId: string)
{
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: 300
  })
}

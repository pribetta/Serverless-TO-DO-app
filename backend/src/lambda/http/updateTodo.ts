import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodoItem } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  try{
    await updateTodoItem(todoId, updatedTodo)

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }

  }catch(err){
    console.log('update failed ', err)
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  
}

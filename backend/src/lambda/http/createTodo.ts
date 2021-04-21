import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { TodoItem } from '../../models/TodoItem'
import { createTodoItem } from '../../businessLogic/todos'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  
  console.log("Create Request : ", newTodo)
  // TODO: Implement creating a new TODO item
  const authHeader:string = event.headers['Authorization']
  const words = authHeader.split(' ')
  const token = words[1]
  
  
  try{
    if(newTodo.name==''){
      throw new Error("Name cannot be empty")      
    }
    const newItem: TodoItem = await createTodoItem(newTodo, token)
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newItem
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
      body:''
    }
  }
  
}


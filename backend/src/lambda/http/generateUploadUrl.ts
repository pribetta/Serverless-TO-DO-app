import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getuploadUrl } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  try{
    const preUrl = await getuploadUrl(todoId)

  return{
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "uploadUrl": preUrl
    })
  }
}catch(err){
  console.log("error fetching upload url")
  
  return {
    statusCode: 400,
    headers: {
      "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "uploadUrl": ''
    })
  }
  }
  
}

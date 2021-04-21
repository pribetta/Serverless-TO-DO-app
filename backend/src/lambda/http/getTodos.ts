import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { getTodoItem } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const authHeader:string = event.headers['Authorization']
  console.log('Get todos, header : ', JSON.stringify(event.headers))
  const words = authHeader.split(' ')
  const token = words[1]
  const userId = parseUserId(token)
  console.log(' user id ', userId)


  try{
    const retBody = await getTodoItem(userId)
  
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Credentials': true
      },
      body: retBody
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
      body: 'Error retrieving to do items'
    }
  }
  

}

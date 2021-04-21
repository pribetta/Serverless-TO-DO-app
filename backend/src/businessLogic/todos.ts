import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils';
import { bucketAccess } from '../dataLayer/bucketAccess';
import { todoAccess } from '../dataLayer/todoAccess';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';

const todoAcc = new todoAccess()
const attachAccess = new bucketAccess()

export async function createTodoItem(newTodo:CreateTodoRequest, token:string): Promise<TodoItem> {
    const userId = parseUserId(token)
    const todoId = uuid.v4()
    const bucketName = attachAccess.getBucketName()

    const item: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    console.log(JSON.stringify({
        item: item
    }))

   const ret  = await todoAcc.createNewTodo(item)
   if(ret==false)
    throw new Error("Couldnt create new item")
   else
    return item
}

export async function getTodoItem(userID: string): Promise<string> {

    const items = await todoAcc.getTodo(userID)
    return JSON.stringify({
        items: items
    })
    
}

export async function updateTodoItem(todoId: string, updatedTodo: TodoUpdate) : Promise<TodoItem> {
    const item = await todoAcc.findTodoByID(todoId)
    console.log('Biz logic layer.. updating.. ', item)
    return await todoAcc.updateTodoByID(item,updatedTodo)
}

export async function deleteTodoItem(todoId: string) {
    const item = await todoAcc.findTodoByID(todoId)
    console.log('Biz logic layer.. deleting..', item)
    await todoAcc.deleteTodo(item)
    await attachAccess.deleteItem(todoId)
}

export async function getuploadUrl(todoId: string) {
    return await attachAccess.getSignedUrl(todoId)
}
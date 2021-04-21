import { TodoItem } from '../models/TodoItem'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ItemList } from 'aws-sdk/clients/dynamodb';
import { TodoUpdate } from '../models/TodoUpdate';

const todoIndex = process.env.TODO_INDEX

export class todoAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOITEMS_TABLE
    ){

    }

    async createNewTodo(item: TodoItem) : Promise<boolean> {
        try{
            await this.docClient.put({
              TableName: this.todoTable,
              Item: item
            }).promise()
            console.log("successfully created an item in to-do table in dynamo db")
            return true
        }catch(err){
            console.log(err)
            console.log('Couldnt create item in dynamo db')
            return false
        }
        
    }

    async getTodo(userId: string): Promise<ItemList> {
        const items =  await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression : 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          }).promise()

        return items.Items
    }

    async findTodoByID(todoId: string): Promise<TodoItem> {

        const res = await this.docClient.query({
            TableName: this.todoTable,
            IndexName:todoIndex,
            KeyConditionExpression: 'todoId=:todoId',
            ExpressionAttributeValues: {
              ':todoId': todoId
            },
            ScanIndexForward: false
          }).promise()
        
        if(res.Count<1)
          throw new Error('No such item found in Todo table')
          
        return {
            userId: res.Items[0].userId,
            todoId: res.Items[0].todoId,
            createdAt: res.Items[0].createdAt,
            name: res.Items[0].name,
            dueDate: res.Items[0].dueDate,
            done: res.Items[0].done,
            attachmentUrl: res.Items[0].attachmentUrl
        }
        
    }

    async updateTodoByID(item: TodoItem, updatedTodo: TodoUpdate): Promise<TodoItem> {
        var info
        await this.docClient.update({
            TableName: this.todoTable,
            Key: {
              userId: item.userId,
              createdAt: item.createdAt
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
              throw new Error(err.message)
            else{
                info = data
                console.log(data)
            }              
          }).promise()

          return info
    }

    async deleteTodo(item: TodoItem) {
        console.log('Deleting ... ', item)
        return await this.docClient.delete({
        TableName: this.todoTable,
        Key: {
            userId: item.userId,
            createdAt: item.createdAt
        }
        }).promise()
    }
    
}
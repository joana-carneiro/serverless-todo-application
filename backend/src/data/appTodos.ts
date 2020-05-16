import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosIdIndex = process.env.TODOS_ID_INDEX

export default class AppTodos {

    //retrieve all the todos for a given user id
    async getUserTodos(userId) {

        const result = await docClient.query({
            TableName: todosTable,
            IndexName: todosIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items;
    }

    //return a spefic item with a given id for a specific user
    async getUserSpecificTodo(userId, todoId) {

        const result = await docClient.get({
            TableName: todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();

        return result.Item;

    }

    async deleteItem (userId, todoId) {

        await docClient.delete({
            TableName: todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }

    //create a new item for the user
    async createTodo(item) {

        await docClient.put({
            TableName: todosTable,
            Item: item
        }).promise();
    }

    //update a given item that belongs to a given user
    async updateTodo(userId,todoId,updatedTodo) {

        await docClient.update({
            TableName: todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':due': updatedTodo.dueDate,
                ':d': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    //update image URL for a given item
    async updateImageURL(userId, todoId, attachmentUrl){

        await docClient.update({
            TableName: todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :a',
            ExpressionAttributeValues: {
                ':a': attachmentUrl
            },
            ReturnValues:"UPDATED_NEW"
        }).promise();

    }


}

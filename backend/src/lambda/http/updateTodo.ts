import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from "aws-sdk";
import {parseUserId} from "../../auth/utils";
import {createLogger} from "../../utils/logger";

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('updateToDos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const todoId = event.pathParameters.todoId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId: parseUserId(jwtToken)
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

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

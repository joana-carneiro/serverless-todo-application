import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import {parseUserId} from "../../auth/utils";
import {createLogger} from "../../utils/logger";

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('generateUploadURL')

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const createSignedUrlRequest = {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  }

  const signedUrl = s3.getSignedUrl('putObject', createSignedUrlRequest)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId: parseUserId(jwtToken)
    },
    UpdateExpression: 'set attachmentUrl = :a',
    ExpressionAttributeValues: {
      ':a': attachmentUrl
    },
    ReturnValues:"UPDATED_NEW"
  }).promise();

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  };
}

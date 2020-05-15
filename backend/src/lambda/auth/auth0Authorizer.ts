import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
//import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-0c7sbbrb.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
//      principalId: jwtToken.sub,
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// async function verifyToken(authHeader: string): Promise<JwtPayload> {

async function verifyToken(authHeader: string) {

  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if (token != 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Rldi0wYzdzYmJyYi5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWViZTlkYTdmNmViY2UwYzVhMDM5ZTE3IiwiYXVkIjoiUFUya3VDYjZ3dzVaZWN0dFR3bUc3ZUxKT2FUQ2puaGwiLCJpYXQiOjE1ODk1NzAxNjAsImV4cCI6MTU5Mzg5MDE2MCwiYXRfaGFzaCI6ImNiSzJmblM2bE1sSzFTTmI1QmFXb2ciLCJub25jZSI6IkRCSzluUkpLYVhrSHJ1Mjc3ZFhDdURQUm95VUhmaGszIn0.QhBAoIBaPdBjViO9FGQyklVgZCGNXj7uflIsQZlJNnA')
    throw new Error('Invalid token')


  return token

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  //return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

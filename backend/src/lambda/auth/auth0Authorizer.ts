import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify,decode, JwtHeader } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'

import { JwtPayload } from '../../auth/JwtPayload'
//import { JwtToken } from '../../auth/JwtToken'
import { Jwt } from '../../auth/Jwt'
//import Axios from 'axios'
import axios from 'axios'

const logger = createLogger('auth')


// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-shrmrwcu.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken: JwtPayload = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
/*
function verifyToken(authHeader: string): JwtToken {
  const token = getToken(authHeader)
 // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  return verify(token, cert, { algorithms : ['RS256']}) as JwtToken
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

} */

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, {complete: true }) as Jwt
  const header:JwtHeader = jwt.header
  const kid = header.kid
  var retVal = undefined
  var res
  await axios.get(jwksUrl).then(resp => {
    res=resp
  }).catch(err => {
    console.log('trouble in axios get() on certificate url')
    throw new Error(err)
  })
  
  var jwkeys = res.data.keys
  const signingkeys = jwkeys.filter( key => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e))).map(key => {
    return { kid: key.kid, nbf: key.nbf, publickey: certToPEM(key.x5c[0]) }
  })

  if(!signingkeys.length){
    throw new Error('The JWKS endpoint did not contain any signature verification keys')
  }
  
  const signingKey = signingkeys.find(key =>key.kid === kid)
  
  if(!signingKey)
    throw new Error(`Unable to find a signing key that matches ${kid}`)
  
  const secret = signingKey.publickey? signingKey.publickey:signingKey.rsapublickey
  
  verify(token, secret, {algorithms: ['RS256']}, function(err,decoded) {
    if(err)
    {
      console.log(err)
      console.log('verify failed')
      throw err
    }
    console.log('Verify succeeded!! ')
    retVal=decoded
  } )
  return retVal
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


function certToPEM( cert ) {
  let pem = cert.match( /.{1,64}/g ).join( '\n' );
  pem = `-----BEGIN CERTIFICATE-----\n${ cert }\n-----END CERTIFICATE-----\n`;
  return pem;
}
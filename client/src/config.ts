// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ou162douol'
export const apiEndpoint = `https://${apiId}.execute-api.ap-south-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-shrmrwcu.us.auth0.com',            // Auth0 domain
  clientId: '381Q2jd52INTZ5ClWCHJmaFr0woo5qPs',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

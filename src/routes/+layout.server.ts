
export async function load({ locals, getClientAddress, fetch }) {
  let requestIp
  let locationData = {}

  try {
    requestIp = getClientAddress()
    console.log('Ip Address form client request: ', requestIp)
  } catch (error) {
    console.log('Error reading Ip')
  }

  return {
    user: locals.user,
    sessionExpired: locals.sessionExpired,
    clientAddress: requestIp,
    locationData: locationData 
  }
}


export async function load({ locals, getClientAddress, fetch }) {
  let requestIp

  try {
    requestIp = getClientAddress()
    console.log('Ip Address form client request: ', requestIp)
  } catch (error) {
    console.log('Error reading Ip')
  }

  try {
    // fetch location data
  const locationResponse = await fetch(`https://ipapi.co/${requestIp}/json`)
  const locationData = await locationResponse.json()

    return {
      locationData: locationData
    }
  } catch (error) {
    console.log(error)
  } 

  return {
    user: locals.user,
    sessionExpired: locals.sessionExpired,
    clientAddress: requestIp
  }
}

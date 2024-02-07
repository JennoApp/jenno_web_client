
export async function load({ locals }) {
  return { user: locals.user, sessionExpired: locals.sessionExpired }
}

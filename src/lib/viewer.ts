/* ============================================================
   Who is making this request? (server only)

   The proxy only checks that the session cookie is signed and in
   date — it cannot reach the database cheaply. Anything that
   depends on *who* the viewer is (role, revocation) goes through
   getViewer(), which also checks the account still exists and the
   cookie was issued after users.sessions_valid_after.
   ============================================================ */

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { getUserById, type UserView } from "./repo";

export async function getViewer(): Promise<UserView | null> {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const user = await getUserById(session.sub);
  if (!user) return null;
  if (session.iat < user.sessionsValidAfter) return null; /* revoked */
  return user;
}

export async function isSalesViewer(): Promise<boolean> {
  return (await getViewer())?.role === "sales";
}

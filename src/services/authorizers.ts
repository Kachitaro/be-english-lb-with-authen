import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata
} from '@loopback/authorization';
import {securityId, UserProfile} from '@loopback/security';
// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
) {
  let currentUser: UserProfile;
  const getId = await authorizationCtx.invocationContext.args[0];
  console.log('ID: ', getId);
  if (authorizationCtx.principals.length > 0) {
    const user = authorizationCtx.principals[0];
    currentUser = user;
  } else {
    return AuthorizationDecision.DENY;
  }

  if (getId == currentUser[securityId]) {
    console.log('HERE 3');
    return AuthorizationDecision.ABSTAIN;
  }
  
  return AuthorizationDecision.DENY;
}

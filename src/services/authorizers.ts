import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import _ from 'lodash';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
) {
  const getId = await authorizationCtx.invocationContext.args[0];
  let currentUserId: number;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'user_id',
      'name',
      'role',
    ]);
    currentUserId = user.user_id;
  } else {
    return AuthorizationDecision.DENY;
  }

  if (getId == currentUserId) {
    return AuthorizationDecision.ABSTAIN;
  }

  return AuthorizationDecision.DENY;
}

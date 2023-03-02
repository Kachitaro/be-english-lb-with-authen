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
  console.log('ID: ', getId);

  let currentUserId: number;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'user_id',
      'name',
      'role',
    ]);
    console.log('USER: ', user);
    currentUserId = user.user_id;
  } else {
    return AuthorizationDecision.DENY;
  }
  console.log('IN META: ', metadata.allowedRoles);
  console.log('userID', currentUserId, getId);

  if (getId == currentUserId) {
    return AuthorizationDecision.ABSTAIN;
  }

  return AuthorizationDecision.DENY;
}

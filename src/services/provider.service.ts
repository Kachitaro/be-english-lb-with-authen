import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
export class MyAuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   */

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    // No access if authorization details are missing
    let currentUser: UserProfile;

    if (context.principals.length > 0) {
      const user = _.pick(context.principals[0], ['id', 'name', 'role']);
      currentUser = {
        [securityId]: user.id,
        name: user.name,
        roles: [user.role],
      };
    } else {
      return AuthorizationDecision.DENY;
    }
    if (!currentUser.roles) {
      return AuthorizationDecision.DENY;
    }
    // Authorize everything that does not have a allowedRoles property
    if (!metadata.allowedRoles) {
      return AuthorizationDecision.ALLOW;
    }

    let roleIsAllowed = false;
    for (const role of currentUser.roles) {
      if (metadata.allowedRoles?.includes(role)) {
        roleIsAllowed = true;
      }
    }
    if (roleIsAllowed) {

      return AuthorizationDecision.ALLOW;
    }

    // Admin and manager accounts bypass id verification
    if (
      currentUser.roles.includes('admin') ||
      currentUser.roles.includes('manager')
    ) {
      //console.log('HERE 6');
      return AuthorizationDecision.ALLOW;
    }

    /**
     * Allow access only to model owners, using route as source of truth
     *
     * eg. @post('/users/{userId}/orders', ...) returns `userId` as args[0]
     */
    if (currentUser[securityId] === context.invocationContext.args[0]) {
      return AuthorizationDecision.ALLOW;
    }

    //console.log('HERE 7');
    return AuthorizationDecision.DENY;
  }
}

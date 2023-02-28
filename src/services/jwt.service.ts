import {TokenService} from '@loopback/authentication';

import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import jwt from 'jsonwebtoken';

export class myJWTService implements TokenService {
  constructor() {}
  verifyToken(token: string) {
    console.log('IM VERIFY');
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    let userProfile: UserProfile;

    try {
      const decoded = jwt.verify(token, 'this-is-my-secret-key') as UserProfile;
      userProfile = {
        ...decoded,
        [securityId]: decoded.user_id,
      };
    } catch (e) {
      console.log(e);
      return e;
    }
    console.log(userProfile);
    return userProfile;
  }

  //   revokeToken?(token: string): Promise<boolean> {
  //   throw new Error('Method not implemented.');
  // }

  async generateToken(userProfile: UserProfile) {
    console.log(userProfile);
    const privateKey = 'this-is-my-secret-key';
    const token = jwt.sign(
      {
        [securityId]: userProfile.id.toString(),
        user_id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
      },
      privateKey,
      {
        expiresIn: '1d',
      },
    );
    return token;
  }
}

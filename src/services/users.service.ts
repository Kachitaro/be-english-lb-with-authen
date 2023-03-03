import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import {Users, UsersWithRelations} from '../models/users.model';
import {UsersRepository} from '../repositories';

/**
 * A pre-defined type for user credentials. It assumes a user logs in
 * using the email and password. You can modify it if your app has different credential fields
 */
export type Credentials = {
  email: string;
  password: string;
};

export class MyUserService implements UserService<Users, Credentials> {
  constructor(
    @repository(UsersRepository) public usersRepository: UsersRepository,
  ) {}

  async verifyCredentials(UsersLogin: Credentials): Promise<Users> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.usersRepository.findOne({
      where: {email: UsersLogin.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      UsersLogin.password,
      foundUser.password,
    );
    console.log(passwordMatched);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    return foundUser;
  }

  convertToUserProfile(user: Users): UserProfile {
    return {
      [securityId]: user.id.toString(),
      name: user.username,
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  //function to find user by id
  async findUserById(id: string): Promise<Users & UsersWithRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.usersRepository.findOne({
      where: {id: id},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }
}

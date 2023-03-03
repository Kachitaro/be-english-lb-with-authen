import {authenticate} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import {
  get,
  param,
  patch,
  getModelSchemaRef,
  post,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import { genSalt, hash, compare } from 'bcryptjs';
import _ from 'lodash';
import {authorize} from '@loopback/authorization';
import {Users} from '../models';
import {UsersRepository} from '../repositories';
import {basicAuthorization} from '../services/authorizers';
import {MyUserService} from '../services/users.service';
import { myJWTService } from './../services/jwt.service';
export class UserController {
  [x: string]: any;
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: myJWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) {}

  @post('/users_login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'SignInPayload',
          }),
        },
      },
    })
    UsersLogin: Users,
  ) {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(UsersLogin);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<object> {
    return currentUserProfile;
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['user'],
    scopes: ['patch'],
    voters: [basicAuthorization],
  })
  @patch('/change_password/{id}',{
    responses:{
      '204': {
        description: 'Password update successful ',
      }
    }
  })
  async patchPassword(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users , {
            exclude: ['id','username','email','roles'],
          }),
        },
      },
    }) Users: Omit<Users, 'id'|'username'|'email'|'roles'>
  ) {
    console.log(Users.password);
    const currentUser  = await this.usersRepository.findOne({
      where: {id: id},
    });
    if (!currentUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    const newPassword = await hash(Users.password, await genSalt());
    await this.usersRepository.updateById(id, {
    password: newPassword,
    });
  }

  @post('/create_user', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': Users,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    Users: Omit<Users, 'id'>
  ): Promise<Users> {
    const password = await hash(Users.password, await genSalt());
    const newUser = {
      ...Users,
      password
    }
    const User = await this.usersRepository.create(newUser);
    await this.usersRepository.manager(User.id).create(_.omit(Users, 'password','roles'));
    return User;
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin','manager'],
    scopes: ['view-all'],
  })
  @get('/users')
  @response(200, {
    description: 'Get all user',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true, exclude: ['password']}),
      },
    },
  })
  async find(
  ): Promise<Users[]> {
    return await this.usersRepository.find();
  }
}


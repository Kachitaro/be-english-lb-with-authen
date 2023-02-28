import {authenticate, TokenService} from '@loopback/authentication';
import {
  Credentials,
  TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  FilterExcludingWhere,
  model,
  property,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
  SchemaObject
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';


import {authorize} from '@loopback/authorization';
import {Users} from '../models';
import {UsersRepository} from '../repositories';
import {basicAuthorization} from '../services/authorizers';
import {MyUserService} from '../services/users.service';

@model()
export class NewUserRequest extends Users {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

@model()
class SignInPayload {
  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;
}

export class UserController {
  [x: string]: any;
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) {}

  @post('/users/login', {
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
          schema: getModelSchemaRef(SignInPayload, {
            title: 'SignInPayload',
          }),
        },
      },
    })
    credentials: SignInPayload,
  ) {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
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

  @post('/signup', {
    responses: {
      '200': {
        description: 'User hehe',
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
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest
  ): Promise<Users> {
    const newUser = {
      ...newUserRequest,
      roles: 'customer',
    };
    const password = await hash(newUser.password, await genSalt());
    const savedUser = await this.usersRepository.create(
      _.omit(newUser, 'password'),
    );
    await this.usersRepository.userCredentials(savedUser.id).create({password});
    return savedUser;
  }

  @get('/users/{id}')
  @response(200, {
    description: 'Get user by id',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'customer'],
    voters: [basicAuthorization],
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Users, {exclude: 'where'}) filter?: FilterExcludingWhere<Users>,
  ): Promise<Users> {
    return this.usersRepository.findById(id, filter);
  }
}

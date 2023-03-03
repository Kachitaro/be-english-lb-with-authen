import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Users,
  Manager,
} from '../models';
import {UsersRepository} from '../repositories';

export class UsersManagerController {
  constructor(
    @repository(UsersRepository) protected usersRepository: UsersRepository,
  ) { }

  @get('/users/{id}/manager', {
    responses: {
      '200': {
        description: 'Users has one Manager',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Manager),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Manager>,
  ): Promise<Manager> {
    return this.usersRepository.manager(id).get(filter);
  }

  @post('/users/{id}/manager', {
    responses: {
      '200': {
        description: 'Users model instance',
        content: {'application/json': {schema: getModelSchemaRef(Manager)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Users.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Manager, {
            title: 'NewManagerInUsers',
            exclude: ['id'],
            optional: ['usersId']
          }),
        },
      },
    }) manager: Omit<Manager, 'id'>,
  ): Promise<Manager> {
    return this.usersRepository.manager(id).create(manager);
  }

  @patch('/users/{id}/manager', {
    responses: {
      '200': {
        description: 'Users.Manager PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Manager, {partial: true}),
        },
      },
    })
    manager: Partial<Manager>,
    @param.query.object('where', getWhereSchemaFor(Manager)) where?: Where<Manager>,
  ): Promise<Count> {
    return this.usersRepository.manager(id).patch(manager, where);
  }

  @del('/users/{id}/manager', {
    responses: {
      '200': {
        description: 'Users.Manager DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Manager)) where?: Where<Manager>,
  ): Promise<Count> {
    return this.usersRepository.manager(id).delete(where);
  }
}

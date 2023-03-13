import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Users, UsersRelations, Manager} from '../models';
import {ManagerRepository} from './manager.repository';

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.id,
  UsersRelations
> {
  [x: string]: any;

  public readonly manager: HasOneRepositoryFactory<Manager, typeof Users.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('ManagerRepository') protected managerRepositoryGetter: Getter<ManagerRepository>,
  ) {
    super(Users, dataSource);
    this.manager = this.createHasOneRepositoryFactoryFor('manager', managerRepositoryGetter);
    this.registerInclusionResolver('manager', this.manager.inclusionResolver);
  }

  async findCredentials(
    userId: typeof Users.prototype.id,
  ): Promise<Manager | undefined> {
    return this.manager(userId)
      .get()
      .catch(err => {
        if (err.code === 'ENTITY_NOT_FOUND') return undefined;
        throw err;
      });
  }
}

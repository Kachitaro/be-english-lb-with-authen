import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Migrations, MigrationsRelations} from '../models';

export class MigrationsRepository extends DefaultCrudRepository<
  Migrations,
  typeof Migrations.prototype.id,
  MigrationsRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(Migrations, dataSource);
  }
}

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {CenterBranch, CenterBranchRelations} from '../models/center-branch.model';

export class CenterBranchRepository extends DefaultCrudRepository<
  CenterBranch,
  typeof CenterBranch.prototype.id,
  CenterBranchRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(CenterBranch, dataSource);
  }
}

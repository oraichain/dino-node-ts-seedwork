/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Identifier } from "src/model";
import { AggregateRoot } from "src/model/Aggregate";
import { CreateEntityProps } from "src/model/Entity";
import { DateVO } from "src/model/valueObjects/Date";
import { TypeormEntityBase } from "./BaseEntity";

export type OrmEntityProps<OrmEntity> = Omit<
  OrmEntity,
  "id" | "createdAt" | "updatedAt"
>;

export interface EntityProps<IdentifierType extends Identifier<any>> {
  id?: IdentifierType;
}

export abstract class OrmMapper<
  IdentifierType extends Identifier<any>,
  Entity extends AggregateRoot<IdentifierType>,
  OrmEntity
> {
  constructor(
    private entityConstructor: new (
      props: CreateEntityProps<IdentifierType>
    ) => Entity,
    private ormEntityConstructor: new (props: any) => OrmEntity
  ) {}

  protected abstract toDomainProps(
    ormEntity: OrmEntity
  ): Promise<EntityProps<IdentifierType>>;

  protected abstract toOrmProps(
    entity: Entity
  ): Promise<OrmEntityProps<OrmEntity>>;

  async toDomainEntity(ormEntity: OrmEntity): Promise<Entity> {
    const { id, ...props } = await this.toDomainProps(ormEntity);
    const ormEntityBase: TypeormEntityBase =
      ormEntity as unknown as TypeormEntityBase;
    return new this.entityConstructor({
      id,
      ...props,
      createdAt: new DateVO(ormEntityBase.createdAt),
      updatedAt: new DateVO(ormEntityBase.updatedAt),
    });
  }

  async toOrmEntity(entity: Entity): Promise<OrmEntity> {
    const props = await this.toOrmProps(entity);
    const createdAt = entity.getCreatedAt();
    const updatedAt = entity.getUpdatedAt();
    return new this.ormEntityConstructor({
      ...props,
      id: entity.id() && entity.id().toValue(),
      updatedAt: updatedAt && updatedAt.getValue(),
      createdAt: createdAt && createdAt.getValue(),
    });
  }
}

import { schemaStrategies } from "@/services/generators";
import { create } from "zustand";
import {
  AddRelationFormProps,
  AttributeSchema,
  AttributeType,
  EntitySchema,
  EntityType,
  ModelType,
  RelationType,
} from "../schemas";

type MousePosition = {
  clientX: number;
  clientY: number;
} | null;

export type State = {
  model: ModelType;
  setTarget: (target: ModelType["target"]) => void;
  // entity actions
  addEntityToModel: (entity: EntityType) => EntityType;
  deleteEntityFromModel: (entityId: EntityType["id"]) => void;
  setEntityPosition: (
    entityId: EntityType["id"],
    x: EntityType["x"],
    y: EntityType["y"]
  ) => void;
  setAnchor: (
    entityId: EntityType["id"],
    fromAnchor: EntityType["fromAnchor"],
    toAnchor: EntityType["toAnchor"]
  ) => void;
  // attribute actions
  addAttributeToEntity: (
    entityId: EntityType["id"],
    attribute: AttributeType
  ) => void;
  deleteAttributeFromEntity: (
    entityId: EntityType["id"],
    attributeId: AttributeType["id"]
  ) => void;
  editAttributeType: (
    entityId: EntityType["id"],
    attributeId: AttributeType["id"],
    type: AttributeType["type"]
  ) => void;
  setAttributeDefault: (
    entityId: EntityType["id"],
    attributeId: AttributeType["id"],
    defaultVal: AttributeType["default"]
  ) => void;
  setAttributeNullable: (
    entityId: EntityType["id"],
    attributeId: AttributeType["id"],
    nullable: AttributeType["nullable"]
  ) => void;
  setAttributeUnique: (
    entityId: EntityType["id"],
    attributeId: AttributeType["id"],
    unique: AttributeType["unique"]
  ) => void;
  // relation actions
  addRelationToModel: (relation: AddRelationFormProps) => EntityType | void;
  deleteRelationFromModel: (relationId: RelationType["id"]) => void;
  // export schema
  generateSchema: () => string;
};

export const getEntityById = (state: State, entityId: EntityType["id"]) => {
  const entity = state.model.entities.find((entity) => entity.id === entityId);
  return entity;
};

export const getEntityByAttributeId = (
  state: State,
  attributeId: AttributeType["id"]
) => {
  const entity = state.model.entities.find((entity) =>
    entity.attributes.find((attribute) => attribute.id === attributeId)
  );
  return entity;
};

const useAppStore = create<State>((set, get) => ({
  model: {
    name: "Tables App",
    entities: [],
    relations: [],
    target: "postgres",
    placementMode: false,
    ghostPosition: null,
  },
  addEntityToModel: (entity) => createEntity(entity, set),
  deleteEntityFromModel: (entityId) =>
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.filter(
          (entity) => entity.id !== entityId
        ),
      },
    })),
  setEntityPosition: (entityId, x, y) => {
    set((state) => {
      const updatedEntities = state.model.entities.map((entity) => {
        if (entity.id === entityId) {
          return { ...entity, x, y };
        }
        return entity;
      });

      return {
        model: {
          ...state.model,
          entities: updatedEntities,
        },
      };
    });
  },
  setAnchor: (entityId, fromAnchor, toAnchor) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.fromAnchor = fromAnchor;
            entity.toAnchor = toAnchor;
          }
          return entity;
        }),
      },
    }));
  },

  addAttributeToEntity: (entityId, attribute) => {
    // parse attribute
    set((state) => {
      try {
        AttributeSchema.parse(attribute);
      } catch (error) {
        console.error("An error occured while adding the attribute", error);
      }

      const entity = state.model.entities.find((nty) => entityId === nty.id);
      if (!entity) {
        throw new Error(`Entity not found by id: ${entityId}`);
      }

      entity.attributes.push(attribute);
      return {
        model: {
          ...state.model,
          entities: state.model.entities.map((nty) =>
            nty.id === entityId ? entity : nty
          ),
        },
      };
    });
  },
  deleteAttributeFromEntity: (entityId, attributeId) => {
    // if attr.foreignKey == true
    // find relation with attr as foreign ket (attr is fk)
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.attributes = entity.attributes.filter(
              (attribute) => attribute.id !== attributeId
            );
          }
          return entity;
        }),
      },
    }));
  },
  editAttributeType: (entityId, attributeId, type) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.attributes = entity.attributes.map((attribute) => {
              if (attribute.id === attributeId) {
                attribute.type = type;
              }
              return attribute;
            });
          }
          return entity;
        }),
      },
    }));
  },
  setAttributeDefault: (entityId, attributeId, defaultVal) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.attributes = entity.attributes.map((attribute) => {
              if (attribute.id === attributeId) {
                attribute.default = defaultVal;
              }
              return attribute;
            });
          }
          return entity;
        }),
      },
    }));
  },
  setAttributeNullable: (entityId, attributeId, nullable) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.attributes = entity.attributes.map((attribute) => {
              if (attribute.id === attributeId) {
                attribute.nullable = nullable;
              }
              return attribute;
            });
          }
          return entity;
        }),
      },
    }));
  },
  setAttributeUnique: (entityId, attributeId, unique) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.attributes = entity.attributes.map((attribute) => {
              if (attribute.id === attributeId) {
                attribute.unique = unique;
              }
              return attribute;
            });
          }
          return entity;
        }),
      },
    }));
  },

  addRelationToModel: (relation) => {
    // TODO: add zod parsing for relation
    switch (relation.type) {
      case "one-to-one":
        createOneToManyRelation(get, relation, set); // Don't tell anyone >:)
        break;
      case "one-to-many":
        createOneToManyRelation(get, relation, set);
        break;
      case "many-to-many":
        createManyToManyRelation(get, relation, set);
        break;
      default:
        throw new Error(`Unknown relation type: ${relation.type}`);
    }
  },

  deleteRelationFromModel: (relationId) =>
    set((state) => ({
      model: {
        ...state.model,
        relations: state.model.relations.filter(
          (relation) => relation.id !== relationId
        ),
      },
    })),
  setTarget: (target) =>
    set((state) => ({
      model: {
        ...state.model,
        target,
      },
    })),

  generateSchema: () => {
    const model = get().model;

    const strategy = schemaStrategies[model.target];
    if (strategy) {
      console.log("Generating schema for target:", model.target);
      return strategy.generateSchema(model);
    } else {
      // Handle case where strategy is not found
      throw new Error(`Unknown target: ${model.target}`);
    }
  },
}));

function createEntity(
  entity: EntityType,
  set: (
    partial:
      | State
      | Partial<State>
      | ((state: State) => State | Partial<State>),
    replace?: boolean | undefined
  ) => void
) {
  try {
    const newEntity = EntitySchema.parse(entity);
    set((state) => ({
      model: {
        ...state.model,
        entities: [...state.model.entities, entity],
      },
    }));
    return newEntity;
  } catch (error) {
    console.error("An error occured while adding the model", error);
    throw error;
  }
}

function createOneToManyRelation(
  get: () => State,
  relation: AddRelationFormProps,
  set: (
    partial:
      | State
      | Partial<State>
      | ((state: State) => State | Partial<State>),
    replace?: boolean | undefined
  ) => void
) {
  const fromEntity = getEntityById(get(), relation.fromEntityId);
  const toEntity = getEntityById(get(), relation.toEntityId);

  if (!fromEntity || !toEntity) {
    throw new Error(
      `Entity not found by id: ${relation.fromEntityId} or ${relation.toEntityId}`
    );
  }

  // create attribute on toEntity
  const attribute: AttributeType = {
    id: crypto.randomUUID(),
    name: `${fromEntity.name.toLowerCase()}Id`,
    type: "identifier",
    primaryKey: false,
    nullable: false,
    unique: false,
    foreignKey: true,
  };
  set((state) => ({
    model: {
      ...state.model,
      entities: state.model.entities.map((entity) => {
        if (entity.id === toEntity.id) {
          entity.attributes.push(attribute);
        }
        return entity;
      }),
    },
  }));

  // create relation
  set((state) => ({
    model: {
      ...state.model,
      relations: [
        ...state.model.relations,
        {
          id: relation.id,
          fromEntity,
          toEntity,
          type: relation.type,
        },
      ],
    },
  }));
}

function createManyToManyRelation(
  get: () => State,
  relation: AddRelationFormProps,
  set: (
    partial:
      | State
      | Partial<State>
      | ((state: State) => State | Partial<State>),
    replace?: boolean | undefined
  ) => void
) {
  console.log("Creating many to many relation");
  const fromEntity = getEntityById(get(), relation.fromEntityId);
  const toEntity = getEntityById(get(), relation.toEntityId);

  if (!fromEntity || !toEntity) {
    throw new Error(
      `Entity not found by id: ${relation.fromEntityId} or ${relation.toEntityId}`
    );
  }

  const throughEntity: EntityType = {
    id: crypto.randomUUID(),
    name: `${fromEntity.name}_${toEntity.name}`,
    x: 0,
    y: 0,
    fromAnchor: null,
    toAnchor: null,
    attributes: [
      {
        id: crypto.randomUUID(),
        name: `${fromEntity.name.toLowerCase()}Id`,
        type: "identifier",
        primaryKey: false,
        nullable: false,
        unique: false,
        foreignKey: true,
      },
      {
        id: crypto.randomUUID(),
        name: `${toEntity.name.toLowerCase()}Id`,
        type: "identifier",
        primaryKey: false,
        nullable: false,
        unique: false,
        foreignKey: true,
      },
    ],
  };

  set((state) => ({
    model: {
      ...state.model,
      entities: [...state.model.entities, throughEntity],
      relations: [
        ...state.model.relations,
        {
          id: crypto.randomUUID(),
          fromEntity,
          toEntity,
          throughEntity,
          type: "many-to-many",
        },
      ],
    },
  }));
}

export default useAppStore;

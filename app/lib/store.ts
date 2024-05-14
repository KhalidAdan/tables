import {
  AddRelationFormProps,
  AttributeSchema,
  AttributeType,
  EntitySchema,
  EntityType,
  ModelType,
  RelationType,
} from "@/lib/schemas/tables-schema";
import { schemaStrategies } from "@/lib/services/generators";
import {
  Edge,
  EdgeChange,
  NodeChange,
  OnEdgesChange,
  OnNodesChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { create } from "zustand";

export type State = {
  model: ModelType;
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  setTarget: (target: ModelType["target"]) => void;
  setPlacementMode: (placementMode: ModelType["placementMode"]) => void;
  setGhostPosition: (position: ModelType["ghostPosition"]) => void;
  // entity actions
  addEntityToModel: (entity: EntityType) => EntityType;
  deleteEntityFromModel: (entityId: EntityType["id"]) => void;

  // attribute actions
  addAttributeToEntity: (
    entityId: EntityType["id"],
    attribute: AttributeType
  ) => void;
  deleteAttributeFromEntity: (
    entityId: EntityType["id"],
    attributeId: AttributeType
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

export let getEntityById = (state: State, entityId: EntityType["id"]) => {
  let entity = state.model.entities.find((entity) => entity.id === entityId);
  return entity;
};

export let getRelationById = (state: State, relationId: RelationType["id"]) => {
  let relation = state.model.relations.find(
    (relation) => relation.id === relationId
  );
  return relation;
};

let useAppStore = create<State>((set, get) => ({
  edges: [],
  model: {
    name: "Tables App",
    entities: [],
    relations: [],
    target: "prisma",
    placementMode: false,
    ghostPosition: { x: 0, y: 0 },
  },

  // ui concerns
  onNodesChange: (changes: NodeChange[]) => {
    let updatedEntities = applyNodeChanges(changes, get().model.entities);

    set((state) => {
      let changes = {
        model: {
          ...state.model,
          entities: updatedEntities,
        },
      };

      return changes as State;
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    let updatedEdges = applyEdgeChanges(changes, get().edges);

    set((state) => ({
      model: {
        ...state.model,
        edges: updatedEdges,
      },
    }));
  },

  setTarget: (target) =>
    set((state) => ({
      model: {
        ...state.model,
        target,
      },
    })),
  setPlacementMode: (placementMode) =>
    set((state) => ({
      model: {
        ...state.model,
        placementMode,
      },
    })),
  setGhostPosition: (position) =>
    set((state) => ({
      model: {
        ...state.model,
        ghostPosition: position,
      },
    })),

  // data concerns
  addEntityToModel: (entity) => {
    return createEntity(entity, set);
  },
  deleteEntityFromModel: (entityId) =>
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.filter(
          (entity) => entity.id !== entityId
        ),
      },
    })),

  addAttributeToEntity: (entityId, attribute) => {
    // parse attribute
    console.log("Before update", entityId);
    try {
      AttributeSchema.parse(attribute);
    } catch (error) {
      console.error("An error occured while adding the attribute", error);
    }

    console.log("model", get().model);

    // add attribute to entity
    let entity = get().model.entities.find((e) => e.id === entityId);
    if (!entity) {
      throw new Error(`Entity not found by id: ${entityId}`);
    }

    let updatedEntities = get().model.entities.map((e) => {
      if (e.id === entityId) {
        return {
          ...e,
          data: {
            ...e.data,
            attributes: [...e.data.attributes, attribute],
          },
        };
      }
      return e;
    });

    set((state) => ({
      model: {
        ...state.model,
        entities: updatedEntities,
      },
    }));
  },
  deleteAttributeFromEntity: (entityId, attribute) => {
    //if attr.relationKey is not undefined
    if (attribute.relationKey) {
      // find relation that attr.relationKey belongs to
      let relation = get().model.relations.find(
        (relation) => relation.id === attribute.relationKey
      );
      if (!relation)
        throw new Error(
          `Relation not found, but relationKey was present on attribute: ${attribute.relationKey}`
        );

      if (relation.type === "many-to-many") {
        // set relationKey to null where attr.relationKey === relationKey on throughEntity
        set((state) => ({
          model: {
            ...state.model,
            entities: state.model.entities.map((entity) => {
              if (entity.id === relation.throughEntity?.id) {
                let newAttributes = entity.data.attributes.map((attr) => {
                  if (attr.relationKey === attribute.relationKey) {
                    return {
                      ...attr,
                      relationKey: undefined,
                    };
                  }
                  return attr;
                });
                return {
                  ...entity,
                  attributes: newAttributes,
                };
              }
              return entity;
            }),
          },
        }));
      }

      // delete relation
      set((state) => ({
        model: {
          ...state.model,
          relations: state.model.relations.filter(
            (relation) => relation.id !== attribute.relationKey
          ),
        },
      }));
    }
    // delete attribute
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            let newAttributes = entity.data.attributes.filter((attr) => {
              return attr.id !== attribute.id;
            });
            console.log(newAttributes);
            return {
              ...entity,
              data: {
                ...entity.data,
                attributes: newAttributes,
              },
            };
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
            return {
              ...entity,
              data: {
                ...entity.data,
                attributes: entity.data.attributes.map((attribute) => {
                  if (attribute.id !== attributeId) {
                    return attribute;
                  }

                  let updatedAttr = { ...attribute, type: type };

                  if (type === "identifier") {
                    updatedAttr.primaryKey = true;
                    updatedAttr.nullable = false;
                  } else if (attribute.primaryKey) {
                    updatedAttr.primaryKey = false;
                  }
                  return updatedAttr;
                }),
              },
            };
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
            return {
              ...entity,
              data: {
                ...entity.data,
                attributes: entity.data.attributes.map((attribute) => {
                  if (attribute.id === attributeId) {
                    return { ...attribute, default: defaultVal };
                  }
                  return attribute;
                }),
              },
            };
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
            return {
              ...entity,
              data: {
                ...entity.data,
                attributes: entity.data.attributes.map((attribute) => {
                  if (attribute.id === attributeId) {
                    return { ...attribute, nullable: nullable };
                  }
                  return attribute;
                }),
              },
            };
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
            return {
              ...entity,
              data: {
                ...entity.data,
                attributes: entity.data.attributes.map((attribute) => {
                  if (attribute.id === attributeId) {
                    return { ...attribute, unique: unique };
                  }
                  return attribute;
                }),
              },
            };
          }
          return entity;
        }),
      },
    }));
  },

  addRelationToModel: (relation) => {
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

  generateSchema: () => {
    console.log("Generating schema");
    let model = get().model;

    let strategy = schemaStrategies[model.target];
    if (strategy) {
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
    let newEntity = EntitySchema.parse(entity);
    console.log("New entity", newEntity);
    set((state) => ({
      model: {
        ...state.model,
        entities: [...state.model.entities, newEntity],
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
  let fromEntity = getEntityById(get(), relation.fromEntityId);
  let toEntity = getEntityById(get(), relation.toEntityId);

  if (!fromEntity || !toEntity) {
    throw new Error(
      `Entity not found by id: ${relation.fromEntityId} or ${relation.toEntityId}`
    );
  }

  // create attribute on toEntity
  let attribute: AttributeType = {
    id: crypto.randomUUID(),
    name: `${fromEntity.data.name.toLowerCase()}Id`,
    type: "identifier",
    primaryKey: false,
    nullable: false,
    unique: false,
    relationKey: relation.id,
  };
  set((state) => ({
    model: {
      ...state.model,
      entities: state.model.entities.map((entity) => {
        if (entity.id === toEntity.id) {
          let updatedAttributes = [...entity.data.attributes, attribute];
          return {
            ...entity,
            type: "entity",
            position: entity.position,
            data: {
              ...entity.data,
              attributes: updatedAttributes,
            },
          };
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
          onDelete: relation.onDelete,
          onUpdate: relation.onUpdate,
        },
      ],
    },
  }));
}

function createManyToManyRelation(
  get: () => State,
  createRelationValues: AddRelationFormProps,
  set: (
    partial:
      | State
      | Partial<State>
      | ((state: State) => State | Partial<State>),
    replace?: boolean | undefined
  ) => void
) {
  let fromEntity = getEntityById(get(), createRelationValues.fromEntityId);
  let toEntity = getEntityById(get(), createRelationValues.toEntityId);

  if (!fromEntity || !toEntity) {
    throw new Error(
      `Entity not found by id: ${createRelationValues.fromEntityId} or ${createRelationValues.toEntityId}`
    );
  }

  let throughEntity: EntityType = {
    id: createRelationValues.id,
    data: {
      name: `${fromEntity.data.name}_${toEntity.data.name}`,
      attributes: [
        {
          id: crypto.randomUUID(),
          name: `${fromEntity.data.name.toLowerCase()}Id`,
          type: "identifier",
          primaryKey: false,
          nullable: false,
          unique: false,
          relationKey: createRelationValues.id,
        },
        {
          id: crypto.randomUUID(),
          name: `${toEntity.data.name.toLowerCase()}Id`,
          type: "identifier",
          primaryKey: false,
          nullable: false,
          unique: false,
          relationKey: createRelationValues.id,
        },
      ],
    },
    position: createRelationValues.position!,
    type: "entity",
  };

  set((state) => ({
    model: {
      ...state.model,
      entities: [...state.model.entities, throughEntity],
      relations: [
        ...state.model.relations,
        {
          id: createRelationValues.id,
          fromEntity,
          toEntity,
          throughEntity,
          type: "many-to-many",
          onDelete: createRelationValues.onDelete,
          onUpdate: createRelationValues.onUpdate,
        },
      ],
    },
  }));
}

export default useAppStore;

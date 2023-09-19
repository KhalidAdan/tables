import { schemaStrategies } from "@/services/generators";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
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

export type State = {
  model: ModelType;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  addNode: (node: Node) => void;
  setTarget: (target: ModelType["target"]) => void;
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
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes: Node[]) => {
    set({
      nodes,
    });
  },
  addNode: (node: Node) => {
    console.log(node);
    set({
      nodes: [...get().nodes, node],
    });
  },

  model: {
    name: "Tables App",
    entities: [],
    relations: [],
    target: "postgres",
  },
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
    console.log("Before update", get().model.entities);
    try {
      AttributeSchema.parse(attribute);
    } catch (error) {
      console.error("An error occured while adding the attribute", error);
    }

    // add attribute to entity
    const entity = get().model.entities.find((e) => e.id === entityId);
    if (!entity) {
      throw new Error(`Entity not found by id: ${entityId}`);
    }

    const updatedEntities = get().model.entities.map((e) => {
      if (e.id === entityId) {
        return {
          ...e,
          attributes: [...e.attributes, attribute],
        };
      }
      return e;
    });
    const updatedNodes = get().nodes.map((node) => {
      if (node.id === entityId) {
        return {
          ...node,
          data: {
            ...node.data,
            attributes: [...node.data.attributes, attribute],
          },
        };
      }
      return node;
    });
    console.log("Updated entities", updatedEntities);
    console.log("Updated nodes", updatedNodes);

    set((state) => ({
      model: {
        ...state.model,
        entities: updatedEntities,
      },
      nodes: updatedNodes,
    }));
  },
  deleteAttributeFromEntity: (entityId, attribute) => {
    //if attr.relationKey is not undefined
    if (attribute.relationKey) {
      // find relation that attr.relationKey belongs to
      const relation = get().model.relations.find(
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
                const newAttributes = entity.attributes.map((attr) => {
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
    // // delete attribute
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            const newAttributes = entity.attributes.filter((attr) => {
              return attr.id !== attribute.id;
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
  },
  editAttributeType: (entityId, attributeId, type) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            return {
              ...entity,
              attributes: entity.attributes.map((attribute) => {
                if (attribute.id === attributeId) {
                  return { ...attribute, type: type };
                }
                return attribute;
              }),
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
              attributes: entity.attributes.map((attribute) => {
                if (attribute.id === attributeId) {
                  return { ...attribute, default: defaultVal };
                }
                return attribute;
              }),
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
              attributes: entity.attributes.map((attribute) => {
                if (attribute.id === attributeId) {
                  return { ...attribute, nullable: nullable };
                }
                return attribute;
              }),
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
              attributes: entity.attributes.map((attribute) => {
                if (attribute.id === attributeId) {
                  return { ...attribute, unique: unique };
                }
                return attribute;
              }),
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
    relationKey: relation.id,
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
  const fromEntity = getEntityById(get(), createRelationValues.fromEntityId);
  const toEntity = getEntityById(get(), createRelationValues.toEntityId);

  if (!fromEntity || !toEntity) {
    throw new Error(
      `Entity not found by id: ${createRelationValues.fromEntityId} or ${createRelationValues.toEntityId}`
    );
  }

  const throughEntity: EntityType = {
    id: createRelationValues.id,
    name: `${fromEntity.name}_${toEntity.name}`,
    attributes: [
      {
        id: crypto.randomUUID(),
        name: `${fromEntity.name.toLowerCase()}Id`,
        type: "identifier",
        primaryKey: false,
        nullable: false,
        unique: false,
        relationKey: createRelationValues.id,
      },
      {
        id: crypto.randomUUID(),
        name: `${toEntity.name.toLowerCase()}Id`,
        type: "identifier",
        primaryKey: false,
        nullable: false,
        unique: false,
        relationKey: createRelationValues.id,
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

useAppStore.subscribe((state) => {
  console.log("New state", state);
});

export default useAppStore;

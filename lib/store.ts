import { schemaStrategies } from "@/services/generators";
import { create } from "zustand";
import {
  AttributeSchema,
  AttributeType,
  EntitySchema,
  EntityType,
  ModelType,
  RelationSchema,
  RelationType,
} from "../schemas";

export type State = {
  model: ModelType;
  setTarget: (target: ModelType["target"]) => void;
  // entity actions
  addEntityToModel: (entity: EntityType) => void;
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
  // relation actions
  addRelationToModel: (relation: RelationType) => void;
  deleteRelationFromModel: (relationId: RelationType["id"]) => void;
  // export schema
  generateSchema: () => string;
};

export const getEntityById = (state: State, entityId: EntityType["id"]) => {
  const entity = state.model.entities.find((entity) => entity.id === entityId);
  return entity;
};

const useAppStore = create<State>((set, get) => ({
  model: {
    name: "Tables App",
    entities: [],
    relations: [],
    target: "postgres",
  },
  addEntityToModel: (entity) => {
    try {
      EntitySchema.parse(entity);
      set((state) => ({
        model: {
          ...state.model,
          entities: [...state.model.entities, entity],
        },
      }));
    } catch (error) {
      console.error("An error occured while adding the model", error);
    }
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
  setEntityPosition: (entityId, x, y) => {
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.map((entity) => {
          if (entity.id === entityId) {
            entity.x = x;
            entity.y = y;
          }
          return entity;
        }),
      },
    }));
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
  addRelationToModel: (relation) => {
    try {
      RelationSchema.parse(relation);
      set((state) => ({
        model: {
          ...state.model,
          relations: [...state.model.relations, relation],
        },
      }));
    } catch (error) {
      console.error("An error occured while adding the relation", error);
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

export default useAppStore;

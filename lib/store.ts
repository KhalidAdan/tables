import { schemaStrategies } from "@/services/generators";
import { create } from "zustand";
import {
  EntitySchema,
  EntityType,
  ModelType,
  RelationSchema,
  RelationType,
} from "../schemas";

type State = {
  model: ModelType;
  addEntityToModel: (entity: EntityType) => void;
  deleteEntityFromModel: (entityId: EntityType["id"]) => void;
  addRelationToModel: (relation: RelationType) => void;
  deleteRelationFromModel: (relationId: RelationType["id"]) => void;
  generateSchema: (model: ModelType, target: "postgres" | "mysql") => string;
};

const useAppStore = create<State>((set) => ({
  model: {
    name: "Tables App",
    entities: [],
    relations: [],
  },
  addEntityToModel: (entity: EntityType) => {
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
  deleteEntityFromModel: (entityId: EntityType["id"]) =>
    set((state) => ({
      model: {
        ...state.model,
        entities: state.model.entities.filter(
          (entity) => entity.id !== entityId
        ),
      },
    })),
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

  generateSchema: (model: any, target: string) => {
    const strategy = schemaStrategies[target];
    if (strategy) {
      return strategy.generate(model);
    } else {
      // Handle case where strategy is not found
      throw new Error(`Unknown target: ${target}`);
    }
  },
}));

export default useAppStore;

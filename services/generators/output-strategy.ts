export abstract class AbstractOutputStrategy {
  toSnakeCase = (str: string): string => {
    return str
      .replace(/\W+/g, " ")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .replace(/([a-z\d])([A-Z])/g, "$1_$2")
      .split(" ")
      .map((word) => word.toLowerCase())
      .join("_");
  };

  toPascalCase = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };
}

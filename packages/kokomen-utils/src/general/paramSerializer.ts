class ParamSerializer {
  static serialize(
    params: Record<
      string,
      | string
      | number
      | boolean
      | undefined
      | string[]
      | number[]
      | boolean[]
      | undefined[]
    >
  ): string {
    return Object.entries(params)
      .filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === "boolean") {
          return value;
        }
        return value !== undefined && value !== null;
      })
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${key}=${v}`).join("&");
        }
        return `${key}=${value}`;
      })
      .join("&");
  }
}

export default ParamSerializer;

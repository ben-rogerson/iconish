export const newId = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2)}`;

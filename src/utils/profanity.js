import Filter from "bad-words";

const filter = new Filter();

export const censorText = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return filter.clean(trimmed);
};

export const isProfane = (value = "") => {
  if (typeof value !== "string") {
    return false;
  }
  return filter.isProfane(value);
};

export default {
  censorText,
  isProfane,
};
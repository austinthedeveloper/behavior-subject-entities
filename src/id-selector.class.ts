export type IdSelectorStr<T> = (model: T) => string;
export type IdSelectorNum<T> = (model: T) => number;

export type IdSelector<T> = IdSelectorStr<T>;
// export type IdSelector<T> = IdSelectorStr<T> | IdSelectorNum<T>;

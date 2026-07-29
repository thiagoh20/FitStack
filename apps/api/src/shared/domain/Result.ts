export type ResultOk<T> = { ok: true; value: T };
export type ResultErr<E = Error> = { ok: false; error: E };
export type Result<T, E = Error> = ResultOk<T> | ResultErr<E>;

export const ok = <T>(value: T): ResultOk<T> => ({ ok: true, value });
export const err = <E = Error>(error: E): ResultErr<E> => ({ ok: false, error });

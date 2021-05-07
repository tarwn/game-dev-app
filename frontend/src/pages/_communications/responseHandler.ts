import { AuthorizationError } from "../../authorization";

export const jsonOrThrow = <T>(r: Response): Promise<T> => {
  if (r.status == 204) {
    return null;
  }
  else if (r.status <= 299) {
    return r.json();
  }
  else if (r.status <= 499) {
    throw Error(`HTTP response error, ${r.status}: ${r.statusText}`);
  }
  else {
    throw Error(`HTTP server error, ${r.status}: ${r.statusText}`);
  }
};

export const nullOrThrow = <T>(r: Response): Promise<T> => {
  if (r.status <= 299) {
    return null;
  }
  else if (r.status <= 499) {
    throw Error(`HTTP response error, ${r.status}: ${r.statusText}`);
  }
  else {
    throw Error(`HTTP server error, ${r.status}: ${r.statusText}`);
  }
};

export const throwFor401 = (r: Response): Response | Promise<any> => {
  if (r.status === 401) {
    return r.json().then(details => {
      throw new AuthorizationError(details?.message ?? "Authorization error");
    });
  }
  return r;
};

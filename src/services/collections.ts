import { api } from "../api";

import { routes } from "../routes";

export const getCollections = () => {
  return api.get<{ result: string }>(routes.api.collections);
};
export function deleteCollections(collectionName: string) {
  return api.delete<{ result: string }>(`/collections/${collectionName}`);
}
export function getCollectionsByName(collectionName: string, offset: number) {
  return api.post<{ result: string }>(
    `/collections/${collectionName}/points/scroll`,
    {
      limit: 10,
      with_payload: true,
      with_vector: false,
      offset: offset,
    }
  );
}

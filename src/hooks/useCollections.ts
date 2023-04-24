import { useMutation, useQuery } from "@tanstack/react-query";
import { collectionServices } from "../services";
import { AxiosError, AxiosResponse } from "axios";

export const useGetCollections = () => {
  return useQuery<AxiosResponse<any>, AxiosError, any>(["collections"], {
    queryFn: async () => collectionServices.getCollections(),
    select(data) {
      const result = data.data.result;
      return result;
    },
  });
};

export const useGetCollectionByName = ({
  collectionName,
  offset,
}: {
  collectionName?: string;
  offset: number;
}) => {
  return useQuery<AxiosResponse<any>, AxiosError, any>(
    ["collections", collectionName, offset],
    {
      queryFn: async () =>
        collectionServices.getCollectionsByName(collectionName!, offset),
      select(data) {
        const result = data.data.result;
        return result;
      },
      enabled: !!collectionName,
    }
  );
};

export const useDeleteCollections = () => {
  return useMutation<AxiosResponse<any>, AxiosError, any>(
    ["deleteCollections"],
    {
      mutationFn: async (collectionName: string) =>
        collectionServices.deleteCollections(collectionName),
      onSuccess(data) {
        const result = data.data.result;
        return result;
      },
    }
  );
};

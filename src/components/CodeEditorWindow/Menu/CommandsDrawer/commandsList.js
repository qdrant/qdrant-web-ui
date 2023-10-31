export const commands = [
  {
    method: "GET",
    command: "/collections",
    description: "List collections",
  },
  {
    method: "GET",
    command: "/collections/{collection_name}",
    description: "Collection info",
  },
  {
    method: "PUT",
    command: "/collections/{collection_name}",
    description: "Create collection",
  }
];


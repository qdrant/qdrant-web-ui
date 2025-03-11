export const customSnippets = [
  {
    documentation: 'Create Simple Collection',
    insertText: `PUT collections/\${1:new_collection_name}
{
  "vectors": {
    "size": \${2:768},
    "distance": "\${3|Dot,Cosine,Euclid,Manhattan|}"
  }
}`,
  },
  {
    documentation: 'Create Hybrid Collection',
    insertText: `PUT collections/\${1:new_collection_name}
{
  "vectors": {
    "\${2:dense_vector_name}": {
      "size": \${3:768},
      "distance": "\${4|Dot,Cosine,Euclid,Manhattan|}"
    }
  },
  "sparse_vectors": {
    "\${5:sparse_vector_name}": {
      "modifier": "\${6|idf,none|}",
      "index": {
        "on_disk": \${7|true,false|}
      }
    }
  }
}`,
  },
];

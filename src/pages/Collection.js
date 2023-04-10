import React from "react";
import { useParams } from "react-router-dom";

function Collection() {
  const { collectionName } = useParams();

  return <>ToDo {collectionName}</>;
}

export default Collection;

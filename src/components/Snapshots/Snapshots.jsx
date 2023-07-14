import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useClient } from "../../context/client-context";
import { Link } from "react-router-dom";

export const Snapshots = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    qdrantClient.listSnapshots(collectionName).then((res) => {
      setSnapshots([...res]);
    }).catch((err) => {
      setError(err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [qdrantClient, collectionName]);

  return (
    <div>
      <h1>Snapshots</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!isLoading && !error && snapshots?.length &&
        snapshots.map((snapshot) => (
          <div key={snapshot.name}>
            <div>{snapshot.name}</div>
            <div>{snapshot.creation_time}</div>
            <div>{snapshot.size}</div>
            <Link to={`${qdrantClient._restUri}/collections/${collectionName}/snapshots/${snapshot.name}`} target={"_blank"}>Download</Link>
          </div>
        ))}
    </div>
  );
};

// props validation
Snapshots.propTypes = {
  collectionName: PropTypes.string.isRequired,
};
import React from 'react';
import PropTypes from 'prop-types';

const IndexAccuracyCheckResult = ({ vectors }) => {
  if (!vectors) {
    return <>No vectors</>;
  }

  return (
    <div>
      <h1>IndexAccuracyCheckResult</h1>
    </div>
  );
};

IndexAccuracyCheckResult.propTypes = {
  vectors: PropTypes.object,
};

export default IndexAccuracyCheckResult;

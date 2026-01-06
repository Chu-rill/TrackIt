import React from "react";
import { RotatingLines } from "react-loader-spinner";
// Check the documentation for other available loaders

const Loader = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
        visible={true}
      />
    </div>
  );
};

export default Loader;

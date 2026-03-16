import React from "react";

const BlurCircle = ({ top, right, bottom, left }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: top,
        right: right,
        bottom: bottom,
        left: left,
        width: "300px",
        height: "300px",
        background:
          "radial-gradient(circle, rgba(248,69,101,0.25) 0%, rgba(0,0,0,0) 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default BlurCircle;

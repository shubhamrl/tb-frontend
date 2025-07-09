// src/components/Loader.js
import React from "react";
export default function Loader() {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh"
    }}>
      <div className="loader"></div>
      <style>
        {`
          .loader {
            border: 6px solid #eee;
            border-top: 6px solid #36d7b7;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}

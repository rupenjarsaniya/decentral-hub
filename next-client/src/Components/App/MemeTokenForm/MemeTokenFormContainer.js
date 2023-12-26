import React from "react";
import MemeTokenForm from ".";

export default function MemeTokenFormContainer({ memetoken, loading }) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return <MemeTokenForm memetoken={memetoken} />;
}

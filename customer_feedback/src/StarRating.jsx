// src/StarRating.js
import React, { useState } from "react";
import "./StarRating.css";

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <span
            key={index}
            className={index <= (hover || rating) ? "star on" : "star off"}
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;

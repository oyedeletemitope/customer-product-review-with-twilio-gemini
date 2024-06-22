import React, { useState } from "react";
import StarRating from "./StarRating";
import "./App.css";
import axios from "axios";

function App() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/api/ratings", {
        name,
        description,
        rating,
      })
      .then((response) => {
        const { sentiment } = response.data;
        let feedbackMessage = "";

        // Adjusted conditional checks to match typical API response
        if (sentiment.toUpperCase() === "POSITIVE") {
          feedbackMessage = "Thank you for your positive feedback!";
        } else if (sentiment.toUpperCase() === "NEGATIVE") {
          feedbackMessage =
            "We are sorry to hear about your experience. We will work on improving it.";
        } else {
          feedbackMessage = "Thank you for your feedback!";
        }

        setFeedback(feedbackMessage);
        setName("");
        setDescription("");
        setRating(0);
      })
      .catch((error) => {
        console.error("There was an error saving the rating!", error);
      });
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Product Review App</h1>
        <StarRating rating={rating} setRating={setRating} />
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Description:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
    </div>
  );
}

export default App;

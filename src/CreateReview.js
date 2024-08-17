import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { gql, useMutation } from "@apollo/client";
import "./CreateReview.css";

const CREATE_REVIEW = gql`
  mutation CreateReviews($date: Date!, $businessId: ID!, $userId: ID!, $text: String!, $stars: Float!) {
    createReviews(
      input: {
        business: { connect: { where: { node: { businessId: $businessId } } } }
        date: $date
        stars: $stars
        text: $text
        user: { connect: { where: { node: { userId: $userId } } } }
      }
    ) {
      reviews {
        business {
          name
        }
        text
        stars
      }
    }
  }
`;

const CreateReview = (props) => {
  const [formState, setFormState] = useState({
    stars: 0.0,
    text: "",
    businessId: "",
    user: "",
  });
  const { user } = useAuth0();
  const date = new Date();
  const [createReview, { loading, error }] = useMutation(CREATE_REVIEW, {
    errorPolicy: "all",
    variables: {
      stars: formState.stars,
      text: formState.text,
      businessId: props.businesses[props.index].businessId,
      userId: user.sub,
      //date: "2022-01-22"
      date: date.toDateString()
    },
  });

  if (loading) return "Submitting...";
  if (error) return `Submission error! ${error.message}`;

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>
          Share Your Thoughts About
          <br />
          {props.businesses[props.index].name}
        </h2>{" "}
        <h4>
          Business Id: &nbsp;
          {props.businesses[props.index].businessId}
        </h4>
        <form
          onSubmit={(e) => {
            setFormState({
              ...formState,
              business: props.businesses[props.index].name,
              user: user.name,
            });
            e.preventDefault();
            createReview();
            props.toggle()
          }}
        >
          <label>
            Stars:
            <input
              type="number"
              step="any"
              onChange={(e) =>
                setFormState({
                  ...formState,
                  stars: e.target.valueAsNumber,
                })
              }
            />
          </label>
          <label>
            Text:
            <input
              type="text"
              onChange={(e) =>
                setFormState({
                  ...formState,
                  text: e.target.value,
                })
              }
            />
          </label>
          <h4>User: {user.name}</h4>
          <h4>sub: {user.sub}</h4>
          <h4>Index: {props.index}</h4>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default CreateReview;

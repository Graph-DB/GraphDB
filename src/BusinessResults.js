import { starredVar } from "./index";
import { useAuth0 } from "@auth0/auth0-react";
import CreateReview, { createReview } from "./CreateReview";
import { useState } from "react";

function BusinessResults(props) {
  const { businesses } = props;
  const starredItems = starredVar();
  const { isAuthenticated } = useAuth0();
  const [formSeen, setFormSeen] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState('');
  //alert("in BusinessResults");

  const toggleForm = (index) => {
    setFormSeen(prevId => (prevId === index ? null : index));
  }

  return (
    <div>
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Address</th>
            <th>Category</th>
            {/*<th>Reviews</th>*/}
            {isAuthenticated ? <th>Average Stars</th> : null}
          </tr>
        </thead>
        <tbody>
          {businesses.map((b, i) => (
            <tr key={i}>
              <td>
                <button
                  onClick={() => {
                    if (b.isStarred)
                      starredVar([
                        ...starredItems.filter((word) => word !== b.businessId),
                      ]);
                    else starredVar([...starredItems, b.businessId]);
                  }}
                >
                  {" "}
                  Star{" "}
                </button>
              </td>
              <td style={b.isStarred ? { fontWeight: "bold" } : null}>
                {b.name}
              </td>
              <td>{b.address}</td>
              <td>
                {b.categories.reduce(
                  (acc, c, i) => acc + (i === 0 ? " " : ", ") + c.name,
                  ""
                )}
              </td>
              {isAuthenticated ? <td>{b.averageStars}</td> : null}
              {isAuthenticated ? (
                <td>
                  <button onClick={() =>toggleForm(i)}> Add Review {b.name} </button>
                  {formSeen === i && <CreateReview  index={i} businesses={businesses} businessName={currentBusiness} toggle={toggleForm} />}
                </td>
              ) : null}
              {/*
              <td>
                {b.reviews.reduce(
                  (acc, c, i) =>
                    c.text === "null" || c.text === null
                      ? ""
                      : acc + (i === 0 || acc === "" ? "" : ", ") + c.text,
                  ""
                )}
              </td>
              */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BusinessResults;

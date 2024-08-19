import React, { useState } from "react";
import BusinessResults from "./BusinessResults";
import BusinessSearch from "./BusinessSearch";
import { gql, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "./Profile";

/*
const BUSINESS_DETAILS_FRAGMENT = gql`
  fragment businessDetails on Business {
    businessId
    name
    address
    categories {
      name
    }
    isStarred @client
  }
`;

const REVIEWS_FRAGMENT = gql`
  fragment reviews on Business {
    reviews {
      text
    }
  }
`;


const GET_BUSINESS_QUERY = gql`
  query BusinessesByCategory($selectedCategory: String!) {
    businesses(
      where: { categories_SOME: { name_CONTAINS: $selectedCategory } }
    ) {
      #...businessDetails
      #...reviews
          }
  }
  ${BUSINESS_DETAILS_FRAGMENT}
  ${REVIEWS_FRAGMENT}
`;
*/
function App() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const GET_BUSINESS_QUERY = gql`
  query BusinessesByCategory($selectedCategory: String!) {
    businesses(
      where: { categories_SOME: { name_CONTAINS: $selectedCategory } }
    ) {
      businessId
      name
      address
      categories {
        name
      }
        
      ${isAuthenticated ? "averageStars" : ""}
      isStarred @client
    }
  }
`;

  const timeBeforeUseQueryCall = new Date();
  const { loading, error, data, refetch } = useQuery(GET_BUSINESS_QUERY, {
    variables: { selectedCategory },
    //pollInterval: 500
  });

  if (error) return <p>Error: {error.message.toString()}</p>;
  if (loading) return <p>Loading...</p>;
  const timeAfterUseQueryCall = new Date();
  return (
    <div>
      <p>{timeBeforeUseQueryCall.toISOString()}</p>
      <p>{timeAfterUseQueryCall.toISOString()}</p>
      {!isAuthenticated && (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      )}
      {isAuthenticated && <button onClick={() => logout()}>Log Out</button>}
      <Profile />
      <BusinessSearch
        selectedCategory={selectedCategory}
        categorySetSelector={setSelectedCategory}
        refetchFunction={refetch}
      />
      <BusinessResults businesses={data.businesses} />
    </div>
  );
}

export default App;

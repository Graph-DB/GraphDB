const { ApolloServer, gql } = require("apollo-server-lambda");
const neo4j = require("neo4j-driver");
const { Neo4jGraphQL } = require("@neo4j/graphql");

const resolvers = {
  Business: {
    waitTime: (obj, args, context, info) => {
      var options = [0, 5, 10, 15, 30, 45];
      return options[Math.floor(Math.random() * options.length)];
    },
  },
};

const typeDefs = `
  type JWT @jwt {
    roles: [String!]!
  }
  
  type Business {
    businessId: ID!
    waitTime: Int! @customResolver
    averageStars: Float
      #@authentication
      @cypher(
        statement: "MATCH (this)<-[:REVIEWS]-(r:Review) RETURN avg(r.stars) as avgStars "
        columnName: "avgStars"
      )
    recommended(first: Int = 1): [Business!]!
      @cypher(
        statement: """
        MATCH (this)<-[:REVIEWS]-(:Review)<-[:WROTE]-(u:User)
        MATCH (u)-[:WROTE]->(:Review)-[:REVIEWS]->(rec:Business)
        WITH rec, COUNT(*) AS score
        RETURN rec ORDER BY score DESC LIMIT $first
        """
        columnName: "rec"
      )
      @authorization(
        validate: [
          { operations: [READ], where: { jwt:{ roles_INCLUDES: "analyst"}}},
        ]
      )

    name: String!
    address: String!
    city: String!
    state: String!
    location: Point!
    reviews: [Review!]! @relationship(type: "REVIEWS", direction: IN)
    categories: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
  }

  type User {
    userId: ID!
    name: String!
    reviews: [Review!]! @relationship(type: "WROTE", direction: OUT)
  }
  extend type User @authorization(
    validate: [
    #  { operations: [CREATE, UPDATE, DELETE], where: { jwt:{ roles_INCLUDES: "admin"}}}
    #{ operations: [READ], where: { jwt:{ roles_INCLUDES: "admin"}}}
    ]
    filter: [
      { operations: [READ], where: {node: {userId: "$jwt.sub"}}}
    ]
  )

  type Review {
    reviewId: ID! @id
    stars: Float!
    date: Date!
    text: String
    user: User @relationship(type: "WROTE", direction: IN)
    business: Business! @relationship(type: "REVIEWS", direction: OUT)
  }
  #extend type Review @authorization(
  #  validate: [
  #    { where: { jwt:{ roles_INCLUDES: "user"}}},
  #         { where: { jwt:{ roles_INCLUDES: "admin"}}},
  #    { when: [AFTER], where: { node: {user: {userId: "$jwt.sub" }}}}]
  #)

  type Category {
    name: String!
    businesses: [Business!]! @relationship(type: "IN_CATEGORY", direction: IN)
    count: Int! @cypher(statement: """
    MATCH (b:Business)-[:IN_CATEGORY]->(this)
    RETURN COUNT(b) as businessCount
    """,
     columnName: "businessCount")
  }

 
 
  type Query  {
    qualityBusiness: [Business] 
      @cypher(        
        statement: """
          MATCH (b:Business)<-[:REVIEWS]-(r:Review WHERE r.stars >=4)
          WITH b, count(r) as numberOfReviews4AndAbove
          WHERE apoc.util.validatePredicate(NOT ($jwt.roles IS NOT NULL AND 'user' IN $jwt.roles), "@neo4j/graphql/FORBIDDEN", [0]) AND numberOfReviews4AndAbove >= 2
          RETURN b
        """
        columnName: "b"
      )
    fuzzyBusinessByName(searchString: String): [Business]
      @cypher(
        statement: """
          CALL
          db.index.fulltext.queryNodes('businessNameIndex', $searchString+'~')
          YIELD node RETURN node
        """,
        columnName: "node"
      )
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver,
  features: {
    authorization: {
      //key: process.env.JWT_SECRET,
      //key: 'JwdnwNN2BDv1BGGJRn1jM420XZA8Z4Yn'
      key: {
        url: "https://dev-spxf3pmvngdhjouv.us.auth0.com/.well-known/jwks.json",
      },
    },
  },
});

const initServer = async () => {
  return await neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
      schema,
      context: ({ event }) => ({ req: event }),
    });
    const serverHandler = server.createHandler();
    return serverHandler;
  });
};

exports.handler = async (event, context, callback) => {
  console.log("before call to initServer")
  const serverHandler = await initServer();
  console.log("after call to initServer")
  return serverHandler(
    {
      ...event,
      requestContext: event.requestContext || {},
    },
    context,
    callback
  );
};

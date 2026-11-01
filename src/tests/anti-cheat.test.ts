import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "../content/search/movieTitle";

function filterMoviesForSearch(query: string, contentPool: "ALL" | "FILM" | "SERIES" | "HYBRID" = "HYBRID") {
  let pool = MOVIES_DATABASE;
  if (contentPool === "FILM") {
    pool = pool.filter(m => m.mediaType !== "SERIES");
  } else if (contentPool === "SERIES") {
    pool = pool.filter(m => m.mediaType === "SERIES");
  }
  if (query.trim().length < 2) return [];
  return pool.filter((movie) => movieMatchesTitleQuery(movie, query));
}

describe("CINEXOX ANTI-CHEAT TEST SUITE", () => {
  console.log("=================================================");
  console.log("CINEXOX ANTI-CHEAT & METADATA LEAK TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`  ✗ FAIL: ${msg}`);
      process.exit(1);
    }
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  }

  // Test 1: Empty or single char query returns 0 items
  assert(filterMoviesForSearch("").length === 0, "Empty query returns 0 movies (no pre-populated browse)");
  assert(filterMoviesForSearch(" ").length === 0, "Whitespace query returns 0 movies");
  assert(filterMoviesForSearch("a").length === 0, "Single character query 'a' returns 0 movies");
  assert(filterMoviesForSearch("t").length === 0, "Single character query 't' returns 0 movies");

  // Test 2: Search with director name does NOT return their movies
  const nolanResults = filterMoviesForSearch("Christopher Nolan");
  assert(
    !nolanResults.some(m => m.title === "Inception" || m.title === "Oppenheimer"),
    "Director search 'Christopher Nolan' does NOT leak Inception or Oppenheimer"
  );

  const tarantinoResults = filterMoviesForSearch("Quentin Tarantino");
  assert(
    !tarantinoResults.some(m => m.title === "Pulp Fiction" || m.title === "Django Unchained"),
    "Director search 'Quentin Tarantino' does NOT leak Pulp Fiction or Django"
  );

  // Test 3: Search with actor name does NOT return their movies
  const dicaprioResults = filterMoviesForSearch("Leonardo DiCaprio");
  assert(
    !dicaprioResults.some(m => m.title === "Titanic" || m.title === "The Wolf of Wall Street"),
    "Actor search 'Leonardo DiCaprio' does NOT leak Titanic or Wolf of Wall Street"
  );

  // Test 4: Search with genre does NOT return genre catalog
  const sciFiResults = filterMoviesForSearch("Bilim Kurgu");
  assert(
    !sciFiResults.some(m => m.title === "Interstellar" || m.title === "The Matrix"),
    "Genre search 'Bilim Kurgu' does NOT leak Interstellar or The Matrix"
  );

  // Test 5: Search with year does NOT return year matches
  const yearResults = filterMoviesForSearch("1994");
  assert(
    !yearResults.some(m => m.title === "The Shawshank Redemption"),
    "Year search '1994' does NOT leak Shawshank Redemption"
  );

  // Test 6: Valid title search returns the movie
  const inceptionResults = filterMoviesForSearch("Inception");
  assert(
    inceptionResults.some(m => m.title === "Inception" || m.originalTitle === "Inception"),
    "Legitimate title search 'Inception' successfully returns the movie"
  );

  // Test 7: Original title search also matches
  const darkKnightResults = filterMoviesForSearch("The Dark Knight");
  assert(
    darkKnightResults.some(m => m.originalTitle?.toLowerCase() === "the dark knight"),
    "Original title search 'The Dark Knight' resolves for Kara Şövalye"
  );

  console.log(`\n=================================================`);
  console.log(`TOTAL RESULT: ${passed}/${passed} PASSED (100%)`);
  console.log(`=================================================`);
});

function describe(name: string, fn: () => void) {
  fn();
}

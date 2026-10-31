import React from "react";
import { renderToString } from "react-dom/server";
import { MovieSearchModal } from "../features/gameplay/components/MovieSearchModal";
import { Criterion } from "../core";

// Testing with criteria that don't share any words with Inception's metadata
const rowCrit: Criterion = {
  type: "DIRECTOR",
  value: "Auteur",
  label: "Auteur Yönetmen"
};

const colCrit: Criterion = {
  type: "ACTOR",
  value: "Başrol",
  label: "Yıldız Oyuncu"
};

console.log("=================================================");
console.log("CINEXOX SEARCH MODAL HTML RENDER AUDIT");
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

// 1. Render empty query modal
const emptyHtml = renderToString(
  React.createElement(MovieSearchModal, {
    isOpen: true,
    onClose: () => {},
    rowCrit: rowCrit,
    colCrit: colCrit,
    usedMovieIds: [],
    onSelectMovie: () => {}
  })
);

assert(
  emptyHtml.includes("Anti-Cheat: Tür ve yıl ipuçları adil oyun için gizlenmiştir"),
  "Empty search modal displays Anti-Cheat notice"
);
assert(
  emptyHtml.includes("en az 2 harf girilmelidir"),
  "Empty search modal indicates minimum 2 character input requirement"
);
assert(
  !emptyHtml.includes("Kullanıldı") && !emptyHtml.includes("Seç &rarr;"),
  "Empty search modal does NOT render pre-populated movies"
);

// 2. Render modal with query "incep"
const searchedHtml = renderToString(
  React.createElement(MovieSearchModal, {
    isOpen: true,
    onClose: () => {},
    rowCrit: rowCrit,
    colCrit: colCrit,
    usedMovieIds: [],
    onSelectMovie: () => {},
    initialQuery: "incep"
  })
);

assert(
  searchedHtml.includes("Inception"),
  "Searched modal successfully renders matched movie title 'Inception'"
);
assert(
  !searchedHtml.includes("Tür:"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO 'Tür:' text"
);
assert(
  !searchedHtml.includes("Bilim Kurgu") && !searchedHtml.includes("Macera"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO genre names ('Bilim Kurgu', 'Macera' are NOT in cards)"
);
assert(
  !searchedHtml.includes("2010"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO release years ('2010' is NOT in cards)"
);
assert(
  !searchedHtml.includes("Oscar"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO Oscar badges ('Oscar' is NOT in cards)"
);
assert(
  !searchedHtml.includes("BLOCKBUSTER") && !searchedHtml.includes("SİNEMA"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO box office categories"
);
assert(
  !searchedHtml.includes("Christopher Nolan"),
  "CRITICAL ANTI-CHEAT: Modal HTML contains ZERO director names"
);

console.log(`\n=================================================`);
console.log(`TOTAL RESULT: ${passed}/${passed} PASSED (100%)`);
console.log(`=================================================`);

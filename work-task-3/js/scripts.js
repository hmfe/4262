"use strict";

var input = document.getElementById("input"),
  button = document.getElementsByTagName("button")[0],
  searchResults = document.getElementsByClassName("search-results")[0],
  searchResultItems = searchResults.getElementsByTagName("li"),
  searchHistory = document.getElementsByClassName("search-history")[0],
  noSearchResults = document.getElementsByClassName("no-results")[0],
  totalResults = [],
  tabindex = 3;

input.addEventListener("keyup", search);
searchResults.addEventListener("click", saveItem);
searchHistory.addEventListener("click", removeItem);
button.addEventListener("click", () => {
  removeChildNodes(searchHistory);
});

//Key code 13 = enter
searchResults.addEventListener("keyup", () => {
  if (event.keyCode === 13) saveItem(event);
});
searchHistory.addEventListener("keyup", () => {
  if (event.keyCode === 13) removeItem(event);
});

/* Removes search results li tags and hides "No search results" p tag if no input/query or if Escape key is pressed.
Otherwise resets totalResults array and calls getData */
function search(event) {
  let query = event.target.value.toLowerCase();
  if (event.key === "Escape" || query.length === 0) {
    removeChildNodes(searchResults);
    toggleNoSearchResults(0);
  } else {
    const url = `https://swapi.co/api/planets/?search=${query}`;
    totalResults = [];
    getData(url, query);
  }
}

// Fetches data based on user query and calls functions to display correct search results
function getData(url, query) {
  fetch(url)
    .then(resp => resp.json()) // Transform the data into JSON
    .then(data => {
      data.results.map(planet => {
        totalResults.push(planet.name);
      }); // Save each planet name to totalResults
      if (data.next) {
        getData(data.next, query); // Get data from next page of results if there is a next page
      } else if (query === input.value.toLowerCase()) {
        displaySearchResults(query);
        removeSearchResults(query);
        toggleNoSearchResults(searchResultItems);
      }
    })
    .catch(error => console.log(`Error: ${error}`));
}

/* For each planet name in totalResults: Checks if there isn't already an existing li tag with that name and checks if the name 
starts with the query (and doesn't just contain it). Creates an li tag with planet name if conditions are met */
function displaySearchResults(query) {
  totalResults.map(planet => {
    let existingPlanet = searchResults.getElementsByClassName(planet);
    if (existingPlanet.length === 0 && planet.toLowerCase().startsWith(query)) {
      let li = document.createElement("li"),
        text = document.createTextNode(planet);
      li.appendChild(text);
      li.className += planet;
      li.setAttribute("tabindex", tabindex++);
      searchResults.appendChild(li);
    }
  });
}

/* Checks if each existing search result li tag contains a planet name that doesn't starts with query. Removes li tags that doesn't 
start with query */
function removeSearchResults(query) {
  Array.from(searchResultItems).map(li => {
    if (li.innerHTML.toLowerCase().startsWith(query) == false)
      searchResults.removeChild(li);
  });
}

// Removes all children tags of a parent tag
function removeChildNodes(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

// Toggle visibility of "No search results" p tag
function toggleNoSearchResults(searchResults) {
  searchResults
    ? (noSearchResults.style.visibility = "visible")
    : (noSearchResults.style.visibility = "hidden");
}

// Appends span with timestamp to clicked li and appends that to the searchHistory ul tag
function saveItem(event) {
  let target, timestamp, span, spanText;
  target = event.target;
  if (target.tagName.toLowerCase() === "li") {
    timestamp = new Date().toLocaleString();
    span = document.createElement("span");
    spanText = document.createTextNode(timestamp);
    span.appendChild(spanText);
    target.appendChild(span);
    searchHistory.appendChild(target);
    removeChildNodes(searchResults); // Remove searchResults ul's li tags
    toggleNoSearchResults(0); // Hide "No search results" p tag
    input.value = ""; // Clear input field
  }
}

// Removes clicked li tag/clicked span's parentNode (= li tag)
function removeItem(event) {
  let target = event.target;
  target.tagName.toLowerCase() === "span"
    ? target.parentNode.parentNode.removeChild(target.parentNode)
    : target.parentNode.removeChild(target);
}

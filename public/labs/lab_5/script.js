function mapInit() {
  const mymap = L.map("mapid").setView([38.98, -76.94], 14);
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoiYWphbnplbiIsImEiOiJja20zbW8xbWYwOXhhMnhsY3lobm54eGExIn0.dgNx_huZHi6xjYl4nsIZ1g",
    }
  ).addTo(mymap);
  return mymap;
}

async function dataHandler(mapObjectFromFunction) {
  const form = document.querySelector(".searchform");
  const search = document.querySelector("#search");
  const endpoint =
    "https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json";

  const request = await fetch(endpoint);
  const types = await request.json();

  function findMatches(numberToMatch, types) {
    return types.filter((choice) => {
      const regex = new RegExp(numberToMatch, "g");
      return choice.zip.match(regex);
    });
  }

  function displayMatches(event) {
    const matchArray = findMatches(event.target.value, types);
    const html = matchArray
      .map((choice) => {
        const regex = new RegExp(event.target.value, "g");

        return `
         <li>
          <div class="decision">${choice.category}, ${choice.name}</div> <br>
          <div class="address"><em>${choice.address_line_1}, <br>
          ${choice.city}, ${choice.state}, ${choice.zip}</em></div>
          </li>
          `;
      })
      .slice(0, 5)
      .join("");

    suggestions.innerHTML = html;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const display = types.filter(
      (record) => record.zip.includes(search.value) && record.geocoded_column_1
    );

    const results = display.slice(0, 5);
    console.table(results);

    results.forEach((location) => {
      const coord = location.geocoded_column_1.coordinates;
      const marker = L.marker([coord[1], coord[0]]).addTo(mapObjectFromFunction);

      
    });

    const { coordinates } = results[0].geocoded_column_1;
    mapObjectFromFunction.panTo([coordinates[1], coordinates[0]], 0);
  });

  const searchInput = document.querySelector(".search");
  const suggestions = document.querySelector(".suggestions");

  searchInput.addEventListener("change", displayMatches);
  searchInput.addEventListener("keyup", (evt) => {
    displayMatches(evt);
  });
}

async function windowActions() {
  const map = mapInit();
  await dataHandler(map);
}

window.onload = windowActions;
// Edit the initial year and number of tabs to match your GeoJSON data and tabs in index.html
var year = "1910";
var tabs = 5;

// Edit the center point and zoom level
var map = L.map('map', {
  center: [41.76, -72.6],
  zoom: 11,
  scrollWheelZoom: false
});

// Edit links to your GitHub repo and data source credit
map.attributionControl
.setPrefix('View <a href="http://github.com/jackdougherty/otl-transit" target="_blank">data and code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>; design by <a href="http://ctmirror.org">CT Mirror</a>');

// Basemap layer
new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

// optional: add legend to toggle any baselayers and/or overlays
// global variable with (null, null) allows indiv layers to be added inside functions below
var controlLayers = L.control.layers( null, null, {
  position: "bottomright", // suggested: bottomright for CT (in Long Island Sound); topleft for Hartford region
  collapsed: false // false = open by default
}).addTo(map);

// Edit to upload GeoJSON data file from your local directory
$.getJSON("Transit-1910-43.geojson", function (data){
  geoJsonLayer = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});

// Any values not listed in the ranges below displays as the last color (blank)
function getColor(d) {
  return  d == "Trolley" ? 'red' :
          d == "Both" ? 'purple' :
          d == "Bus" ? 'blue' :
          '';
}

// Edit the getColor property to match data properties in your GeoJSON file
function style(feature) {
  return {
    color: getColor(feature.properties["Type" + year]),
    weight: 2,
  };
}

// This highlights the polygon on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    color: 'black',
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature
  });
}

// Creates an info box on the map
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Edit info box labels (such as props.town) to match properties of the GeoJSON data
info.update = function (props) {
  var winName =
  this._div.innerHTML =
  (props ? '<div class="areaLabel">' +
    (props ? '<div class="areaLabel">Route: ' + (checkNull(props.Route)) : '--') +
    '</div>' :
      '<div class="areaLabel">Hover for route info</div>') +
  '<div class="areaLabel">Trolley or Bus: ' +(props ? '' + (checkNull(props["Type" + year])) : '--') + '</div>' +
  '<div class="areaLabel">Peak service: every '  +(props ? '' + (checkNull(props["Peak" + year])) + ' min' : '--') + '</div>';
};
info.addTo(map);

// When a new tab is selected, this changes the year displayed
$(".tabItem").click(function() {
  $(".tabItem").removeClass("selected");
  $(this).addClass("selected");
  year = $(this).html();
  // year = $(this).html().split("-")[1];  /* use for school years, eg 2010-11 */
  geoJsonLayer.setStyle(style);
});

// tileLayer.WMS - see http://leafletjs.com/reference.html#tilelayer-wms
// UConn MAGIC WMS settings - see http://geoserver.lib.uconn.edu:8080/geoserver/web/?wicket:bookmarkablePage=:org.geoserver.web.demo.MapPreviewPage
var aerial1934 = new L.tileLayer.wms("http://geoserver.lib.uconn.edu:8080/geoserver/MAGIC/wms?", {
  layers: 'MAGIC:1934 Connecticut Aerial Photography',
  format: 'image/png',
  version: '1.1.0',
  transparent: true,
  attribution: '1934 <a href="http://magic.library.uconn.edu">MAGIC UConn</a> and <a href="http://cslib.org">CSL</a>'
});
controlLayers.addOverlay(aerial1934, '1934 aerial map');



// In info.update, this checks if GeoJSON data contains a null value, and if so displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

// This watches for arrow keys to advance the tabs
$("body").keydown(function(e) {
    var selectedTab = parseInt($(".selected").attr('id').replace('tab', ''));
    var nextTab;

    // previous tab with left arrow
    if (e.keyCode == 37) {
        nextTab = (selectedTab == 1) ? tabs : selectedTab - 1;
    }
    // next tab with right arrow
    else if (e.keyCode == 39)  {
        nextTab = (selectedTab == tabs) ? 1 : selectedTab + 1;
    }

    $('#tab' + nextTab).click();
});

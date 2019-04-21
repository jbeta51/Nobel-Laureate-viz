// Global Variables for time slider
// represents what the slider values mean
var year = ["1901","1902","1903","1904","1905","1906","1907","1908","1909","1910","1911","1912","1913","1914","1915","1916","1917","1918","1919","1920","1921","1922","1923","1924","1925","1926","1927","1928","1929","1930","1931","1932","1933","1934","1935","1936","1937","1938","1939","1943","1944","1945","1946","1947","1948","1949","1950","1951","1952","1953","1954","1955","1956","1957","1958","1959","1960","1961","1962","1963","1964","1965","1966","1967","1968","1969","1970","1971","1972","1973","1974","1975","1976","1977","1978","1979","1980","1981","1982","1983","1984","1985","1986","1987","1988","1989","1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015"];
var inputValue = year[0]; // holds the input value from the time slider, init to 1901


(function() {
	var margin = { top: 50, left: 50, right: 50, bottom: 50 },
			height = 800 - margin.top - margin.bottom,
			width = 1600 - margin.left - margin.right;

	var svg = d3.select("#map")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.attr("style", "outline: thin solid red;")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var div = d3.select("body").append("div")	
		.attr("class", "tooltip")				
		.style("opacity", 0);
	/*
		Queue up what we are going to import:
		Read in world.topojson -- topojson is a fancier/nicer form of geojson file format
			build maps at geojson.io in the geojson format
			geojson is very very large -- that's a long download time for user
			d3 is to produce for the web, so we need small file sizes
			topojson is perfect for pulling in map data / geographic data in d3
			a csv is really good for point data, dealing with just latitude and longitude
			for shapes like countries, counties, etc use toposon


		Read in capitals.csv
	*/
	d3.queue()
		.defer(d3.json, "world-countries.json")
		.defer(d3.csv, "nobel_laureates_clean.csv")
		.await(ready)
	/*
		Create a new projection using Mercator (geoMercator)
		center it (translate)
		zoom in a certain amount (scale)

		to convert to a globe from something flat
	*/
	var projection = d3.geoMercator()
		.translate([width/2, height/1.5]) // centered
		.scale(250)


	/*
		Create a path (geoPath) using the projection
		Map visual generator
		Use this every time we have shapes on a map
	*/
	var path = d3.geoPath()
		.projection(projection)



	function ready (error, countries_data, laureates_data) {
		// to see what the data looks like.
		// console.log(countries_data)
		/*
			topojson.feature converts our RAW geo data into USEABLE geo data,
			always pass it data,
			then data.objets.___something___,
			then get .features out of it
		*/

		var countries = topojson.feature(countries_data, countries_data.objects.countries1).features
		// feature(root of our data, specific data we are looking for)
		// console.log(countries)


		/*
			Add a path for each country
			We use shapes for path objects
		*/
		svg.selectAll(".country") // give it a class of country
			.data(countries) // bind our countries
			.enter().append("path") // do an enter, add a path for every country
			.attr("class", "country") // set it to be a class of country
			.attr("d", path) // d is a list of coords and a certain way to move btwn coords in order to draw a shape


		/*
			Add the cities
			Get the x/y from the lat/long + projection
			Convert lat and lng into something usable with x and y
		*/
		// console.log(laureates_data)
		svg.selectAll(".city-circle")
			.data(laureates_data)
			.enter().append("circle")
			.attr("r", function(d) {
				if (d.year == 1901) {
					return d.gender == "female" ? 6 : 1 ;
				} else {
					return 0;
				}
			})
			.attr("cx", function(d) {
				var coords = projection([d.lng, d.lat]) // use a projection to translate from a globe to flat screen w lng and lat
				return coords[0];
			})
			.attr("cy", function(d) {
				var coords = projection([d.lng, d.lat]) // use a projection to translate from a globe to flat screen w lng and lat
				return coords[1];
			})
			.attr("stroke", "black")
			.attr("stroke-width", "1px")
			.attr("fill", function(d) {
				switch(d.category) {
					case "peace":
					  return "red";
					case "economics":
					  return "blue";
					case "chemistry":
					  return "yellow";
					case "literature":
					  return "green";
					case "physics":
					  return "purple";
					case "medicine":
					  return "teal";
					default:
					  // console.log(d.category);
					  return "black";
				  }
			});
			females = svg.selectAll("circle").filter(function(d) {return d.gender == "female";});

			females.on("mouseover", function(d) {		
				div.transition()		
					.duration(200)		
					.style("opacity", .9);
				//  img path

				var imgPath = "res/imgs/" + (d.firstname).split(" ")[0] + ".jpg";	
				console.log(imgPath);
				div	.html("<h1>" + (d.fullname) + "</h1> <br/>" +
						  "<img width='128' src=" + imgPath + " /img> <br/>" +
						  "<span style='color:red'>" + (d.category) + "</span>")

					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY - 28) + "px");	
			})
			.on("mouseout", function(d) {		
				div.transition()		
					.duration(500)		
					.style("opacity", 0);	
			});

		// d3.selectAll(".city-label")

		// when the input range changes update the rectangle 
    	d3.select("#timeslide").on("input", function() {
        	update(+this.value);
    	});

	    function update(value) {
	        document.getElementById("range").innerHTML=year[value];
	        inputValue = year[value];
	        console.log(inputValue);
	        svg.selectAll("circle")
				.attr("r", function(d) {
					if (d.year <= inputValue) {
						return d.gender == "female" ? 6 : 1 ;
					} else {
						return 0;
					}
				})
		}	
	}
})();

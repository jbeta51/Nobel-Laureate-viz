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
				return d.gender == "female" ? 6 : 2 
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
					  console.log(d.category);
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

		// svg.selectAll(".city-label")
		// 	.data(laureates_data)
		// 	.enter().append("text")
		// 	.attr("class", "city-label")
		// 	.attr("x", function(d) {
		// 		var coords = projection([d.lng, d.lat]) // use a projection to translate from a globe to flat screen w lng and lat
		// 		console.log(coords)
		// 		return coords[0];
		// 	})
		// 	.attr("y", function(d) {
		// 		var coords = projection([d.lng, d.lat]) // use a projection to translate from a globe to flat screen w lng and lat
		// 		console.log(coords)
		// 		return coords[1];
		// 	})
		// 	.text(function(d) {
		// 		return d.name;
		// 	})
	}
})();

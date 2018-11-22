var margin = {top: 20, right: 100, bottom: 30, left: 80},
    width = 800,
    height = 600;

d3.csv("movies.csv", function(error, csvdata) {
    if(error)
        console.log(error);

    var dataset1 = [],
        dataset2 = [],
        dataset3 = [];
    csvdata.forEach(data => {
        dataset1.push({"x": Number(data.imdbRating), "y": Number(data.WinsNoms), "symbol": Number(data.IsGoodRating)});
        dataset2.push({"x": Number(data.imdbRating), "y": Number(data.Budget), "symbol": Number(data.IsGoodRating)});
        dataset3.push({"x": Number(data.imdbRating), "y": Number(data.imdbVotes), "symbol": Number(data.IsGoodRating), "size": Number(data.WinsNoms)})
    });

    drawChart("#scatterplot1", dataset1, "linear", {"xLabel": "IMDb Rating", "yLabel": "Wins+Noms"});
    drawChart("#scatterplot2", dataset2, "linear", {"xLabel": "IMDb Rating", "yLabel": "Budget"});
    drawChart("#scatterplot3", dataset3, "linear", {"xLabel": "IMDb Rating", "yLabel": "IMDb Votes"});
    drawChart("#scatterplot4", dataset1, "sqrt", {"xLabel": "IMDb Rating", "yLabel": "Wins+Noms"});
    drawChart("#scatterplot5", dataset1, "log", {"xLabel": "IMDb Rating", "yLabel": "Wins+Noms"});
});

function drawChart(id, dataset, scaleType, label) {
    // initialize svg
    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height);

    // calculate scales
    var xScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { return d.x; })])
        .range([margin.left, width - margin.right]);

    var yScale;
    switch (scaleType) {
        case "sqrt":
            yScale = d3.scale.sqrt()
                .domain([0, d3.max(dataset, function(d) { return d.y; })])
                .range([height - margin.bottom, margin.top]);
            break;
        case "log":
            yScale = d3.scale.log().clamp(true)
                .domain([0.1, d3.max(dataset, function(d) { return d.y; })])
                .range([height - margin.bottom, margin.top]);
            break;
        default:
            yScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function(d) { return d.y; })])
                .range([height - margin.bottom, margin.top]);
            break;   
    }

    var sizeScale = d3.scale.linear()
        .domain(d3.extent(dataset, function(d) { return d.size; }))
        .range([30, 80]);

    // draw axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .innerTickSize(-height + margin.bottom + margin.top)
        .outerTickSize(0)
        .tickPadding(10)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .innerTickSize(-width + margin.left + margin.right)
        .outerTickSize(0)
        .orient("left");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height-margin.bottom) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);
    
    // draw scattered points
    svg.append("g")
        .attr("class", "symbols")
        .selectAll("path")
        .data(dataset)
        .enter()
        .append("path")
        .attr("d", d3.svg.symbol().type(function(d) { return d.symbol == 0? "circle":"cross"; }).size(function(d) { return d.size == undefined? 50:sizeScale(d.size) }))
        .style("stroke", function(d) { return d.symbol == 0? "red":"blue"; })
        .style("fill", "none")
        .attr("transform", function(d) {
            return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
        });
    
    // draw axis labels
    svg.append("text")
        .text(label.xLabel)
        .attr("class", "label")
        .attr("x", width - margin.right)
        .attr("y", height - margin.bottom);

    svg.append("text")
        .text(label.yLabel)
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("dx", -100)
        .attr("dy", 100);
    
    // draw legends
    var legend = svg.append("g")
        .attr("class", "legend")

    legend.append("path")
        .attr("d", d3.svg.symbol().type("cross"))
        .attr("stroke", "blue")
        .attr("fill", "none")
        .attr("transform", "translate(" + (width-margin.right+20) + "," +  (margin.top+15) + ")");
    legend.append("text")
        .text("good rating")
        .attr("fill", "blue")
        .style("font-weight", "700")
        .attr("transform", "translate(" + (width-margin.right+30) + "," +  (margin.top+18) + ")");

    legend.append("path")
        .attr("d", d3.svg.symbol().type("circle"))
        .attr("stroke", "red")
        .attr("fill", "none")
        .attr("transform", "translate(" + (width-margin.right+20) + "," +  (margin.top+45) + ")");
    legend.append("text")
        .text("bad rating")
        .attr("fill", "red")
        .style("font-weight", "700")
        .attr("transform", "translate(" + (width-margin.right+30) + "," +  (margin.top+48) + ")");
}

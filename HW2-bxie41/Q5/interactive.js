var data = [
    {city: 'San Antonio', population_2012: 1383505, growth: {year_2013:25405, year_2014:26644 , year_2015:28593 , year_2016:23591 , year_2017:24208}},
    {city: 'New York', population_2012: 8383504, growth: {year_2013:75138 , year_2014:62493 , year_2015:61324 , year_2016:32967 , year_2017:7272}},
    {city: 'Chicago', population_2012: 2717989, growth: {year_2013:6493 , year_2014:2051 , year_2015:-1379 , year_2016:-4879 , year_2017:-3825}},
    {city: 'Los Angeles', population_2012: 3859267, growth:{year_2013:32516 , year_2014:30885 , year_2015:30791 , year_2016:27657 , year_2017:18643}},
    {city: 'Phoenix', population_2012: 1495880, growth: {year_2013:25302 , year_2014:26547 , year_2015:27310 , year_2016:27003 , year_2017:24036}}
];

// reshape data
data.forEach(item => {
    var totalPopulation = item.population_2012;
    var growth = item.growth;
    for (var attr in growth)
        totalPopulation += growth[attr];
    item["total_population"] = totalPopulation;
});

data.sort(function(a, b) {
    return a["total_population"] < b["total_population"]? 1:-1;
});

var margin1 = {top: 20, right: 20, bottom: 20, left: 100},
    width1 = 800,
    height1 = 400;

var margin2 = {top: 30, right: 20, bottom: 50, left: 30},
    width2 = 400,
    height2 = 300;

// draw bar-chart
var svg1 = d3.select(".bar-chart")
    .append("svg")
    .attr("width", width1)
    .attr("height", height1);

var svg2 = d3.select(".line-chart")
        .append("svg")
        .attr("width", width2)
        .attr("height", height2)

var xScale = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.total_population })])
    .range([margin1.left, width1 - margin1.right]);

var yScale = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.city }))
    .rangeBands([margin1.top, height1 - margin1.bottom], 0.4);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .innerTickSize(0)
    .outerTickSize(0)
    .tickFormat(function(d) { return d; })
    .orient("left");

svg1.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + margin1.left + ",0)")
    .call(yAxis)
    .selectAll("text")
    .attr("fill", "#a9a9a9");

var bars = svg1.append("g")
    .attr("class", "bars");

var bar = bars.selectAll(".bar")
    .data(data).enter()
    .append("g")
    .attr("class", "bar")
    .on("mouseover", onMouseover)
    .on("mouseleave", onMouseleave);

bar.append("rect")
    .attr("class", "bar-rect")
    .attr("x", margin1.left)
    .attr("y", function(d) { return yScale(d.city); })
    .attr("width", function(d) { return xScale(d.total_population) - margin1.left; })
    .attr("height", yScale.rangeBand())
    .attr("fill", "#a9a9a9");

bar.append("text")
    .attr("class", "bar-label")
    .text(function(d) { return d.total_population.toLocaleString(); })
    .attr("x", margin1.left + 20)
    .attr("y", function(d) { return yScale(d.city) + yScale.rangeBand() / 2; })
    .attr("alignment-baseline", "middle")
    .attr("fill", "white")
    .style("pointer-events", "none");

function onMouseover() {
    var target = d3.select(this).select(".bar-rect")
        .attr("fill", "#6ac8ee");

    var targetData = target.datum();
    var growth = targetData.growth;
    var total_population = targetData.population_2012;
    var reshapedData = [];
    for (var attr in growth) {
        reshapedData.push({
            "year": attr.substring(5),
            "grow_rate": growth[attr] / total_population
        });
        total_population += growth[attr];
    }

    // draw line-chart
    var xScale = d3.scale.linear()
        .domain([d3.min(reshapedData, function(d) { return d.year; }), d3.max(reshapedData, function(d) { return d.year; })])
        .range([margin2.left, width2 - margin2.right]);
    
    var yScale = d3.scale.linear()
        .domain([d3.min(reshapedData, function(d) { return d.grow_rate; }), d3.max(reshapedData, function(d) { return d.grow_rate; })])
        .range([height2 - margin2.bottom, margin2.top]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(reshapedData.length)
        .tickFormat(function(d) { return Number(d); })
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function(d) { return (d * 100).toFixed(2); })
        .orient("left");

    svg2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height2 - margin2.bottom) + ")")
        .call(xAxis);

    svg2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin2.left + ",0)")
        .call(yAxis);

    svg2.append("text")
        .attr("class", "axis-label")
        .text("Year")
        .attr("x", width2 - margin2.right)
        .attr("y", height2 - 10)
        .attr("text-anchor", "middle");

    svg2.append("text")
        .attr("class", "axis-label")
        .text("Pct %")
        .attr("x", 0)
        .attr("y", 5)
        .attr("alignment-baseline", "hanging");

    var line = d3.svg.line()
        .x(function(d) { return xScale(d.year) })
        .y(function(d) { return yScale(d.grow_rate) });

    svg2.append("path")
        .attr("class", "line")
        .attr("d", line(reshapedData))
        .attr("fill", "none")
        .attr("stroke", "#3705ff");
}

function onMouseleave() {
    d3.select(this).select(".bar-rect")
        .attr("fill", "#a9a9a9");

    svg2.selectAll("*").remove();
}
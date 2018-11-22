var width = 960,
    height = 600;

var svg = d3.select(".choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var yScale = d3.scale.linear()
    .domain([0, 100])
    .rangeRound([100, 270]);

var colorScale = d3.scale.threshold()
    .domain([10, 20, 30, 40, 50, 60, 70, 80, 90])
    .range(["#dadaeb", "#c9c2df", "#b8aad3", "#a691c6", "#9579ba", "#8461ae", "#7349a2", "#613095", "#501889", "#3f007d"]);

var legend = svg.append("g")
    .attr("class", "legend");

legend.selectAll("rect")
    .data(colorScale.range().map(function(d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = yScale.domain()[0];
        if (d[1] == null) d[1] = yScale.domain()[1];
        return d;
    }))
    .enter()
    .append("rect")
    .attr("x", width - 100)
    .attr("y", function(d) { return yScale(d[0]); })
    .attr("width", 30)
    .attr("height", function(d) { return yScale(d[1]) - yScale(d[0]); })
    .attr("fill", function(d) { return colorScale(d[0]); });

var yAxis = d3.svg.axis()
    .scale(yScale)
    .tickFormat(function(yScale) { return  yScale + "%"; })
    .tickValues(["0"].concat(colorScale.domain()))
    .innerTickSize(5)
    .outerTickSize(0)
    .orient("right");

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (width - 70) + ",0)")
    .call(yAxis);

var education = d3.map();
var education_details = [];

var path = d3.geo.path();

d3.queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "education.csv", function(d) { education.set(d.id, +d.percent_educated); })
    .defer(d3.csv, "education_details.csv", function(d) { 
        if (d.id != "")
            education_details.push({"id": d.id, "qualified_professionals": d.qualified_professionals, "high_school": d.high_school, "middle_school_or_lower": d.middle_school_or_lower})
    })
    .await(ready);

function ready(error, us) {
    if (error)
        throw error;

    var tip = d3.tip().attr('class', 'd3-tip')
        .html(function(d) {
            var detail = education_details.find(function(item) { return item.id == d.id });
            return "<div><span>County: </span><span>" + d.id + "</span></div>" 
            + "<div><span>Percentage Educated: </span><span>" + d.percent_educated + "</span></div>"
            + "<div><span>Qualified Professionals: </span><span>" + detail.qualified_professionals + "</span></div>"
            + "<div><span>High school graduates: </span><span>" + detail.high_school + "</span></div>"
            + "<div><span>Middle school or lower graduates: </span><span>" + detail.middle_school_or_lower + "</span></div>";
        });

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("fill", function(d) { return colorScale(d.percent_educated = education.get(d.id)); })
        .attr("d", path)
        .call(tip)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states), function(a, b) { return a.id !== b.id; })
        .attr("class", "states")
        .attr("d", path);
}

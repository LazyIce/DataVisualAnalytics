var margin = {top: 50, right: 150, bottom: 250, left: 150},
    width = 860,
    height = 790,
    colors = ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"];

var svg = d3.select(".heatmap").append("svg")
    .attr("width", width)
    .attr("height", height);

drawHeatmap();

function drawHeatmap() {
    d3.csv("heatmap.csv", function(error, csvdata) {
        if(error)
            console.log(error);

        var rawdata = csvdata.filter(data => data["House"] !== "" && data["House"] !== undefined );
        var dataset = [],
            map = {};

        rawdata.forEach(data => {
            if (!map[data["House"]]) {
                dataset.push({
                    "house": data["House"], 
                    "data": reshapeData(data)
                });
                map[data["House"]] = data;
            } else {
                dataset.find(item => item["house"] == data["House"])["data"] = dataset.find(item => item["house"] == data["House"])["data"].concat(reshapeData(data));
            }
        });  

        // draw select and choose data
        var select = d3.select(".select")
            .append("select")
            .on("change", onchange);

        select.selectAll("option")
            .data(dataset).enter()
            .append("option")
            .text(function(d) { return d.house; });

        var selectValue = d3.select("select").property("value");
        var selectData = dataset.find(item => item.house == selectValue)["data"]
            .sort(function(a, b) {
                return a["type"] > b["type"]? 1:-1;
            });

        // calculate scales
        var xElements = selectData.map(function(d) { return d.type; }),
            yElements = selectData.map(function(d) { return d.book });

        var xScale = d3.scale.ordinal()
            .domain(xElements)
            .rangeBands([margin.left, width - margin.right]);

        var yScale = d3.scale.ordinal()
            .domain(yElements)
            .rangeBands([margin.top, height - margin.bottom]);  

        // draw axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .innerTickSize(0)
            .outerTickSize(0)
            .tickFormat(function(d) { return d; })
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .innerTickSize(0)
            .outerTickSize(0)
            .tickFormat(function(d) { return d; })
            .orient("left"); 

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height-margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("dx", -5)
            .attr("dy", 2);
    
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);
    
        // draw axis labels
        svg.append("text")
            .text("Spell Type")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", height - margin.bottom)
            .attr("dx", 20)
            .attr("dy", 20)
    
        svg.append("text")
            .text("Book")
            .attr("class", "label")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("dx", -50)
            .attr("dy", -10);

        // draw tiles container
        svg.append("g")
            .attr("class", "tiles")
        // draw legends container
        svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + margin.left + "," + (height-120) + ")")
            .append("text")
            .text("No. of Spells")
            .attr("class", "legend-title");

        updateHeatmap(selectData);

        function onchange() {
            var selectValue = d3.select("select").property("value");
            var selectData = dataset.find(item => item.house == selectValue)["data"]
                .sort(function(a, b) {
                    return a["type"] > b["type"]? 1:-1;
                });
            updateHeatmap(selectData);
        }

        function updateHeatmap(selectData) {
            var colorScale = d3.scale.quantile()
                .domain([0, 8, d3.max(selectData, function(d) { return d.value })])
                .range(colors); 
        
            // draw tiles
            var tile = d3.select(".tiles").selectAll(".tile").data(selectData);
            
            tile.enter()
                .append("rect")
                .attr("class", "tile")
                .attr("x", function(d) { return xScale(d.type); })
                .attr("y", function(d) { return yScale(d.book) })
                .attr("width", xScale.rangeBand() - 1)
                .attr("height", yScale.rangeBand() - 1)
                .attr("stroke", "#e6e6e6")
                .attr("rx", 5).attr("ry", 5)
                .style("fill", colors[0])

            tile.transition().duration(1000)
                .style("fill", function(d) { return colorScale(d.value); });

            tile.exit().remove();
        
            // draw legends
            var legendItem = d3.select(".legend").selectAll(".legend-item")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; })
            
            legendItem.enter().append("g")
                .attr("class", "legend-item");
        
            legendItem.append("rect")
                .attr("x", function(d, i) { return i * xScale.rangeBand(); })
                .attr("y", 20)
                .attr("width", xScale.rangeBand())
                .attr("height", xScale.rangeBand() / 3)
                .attr("fill", function(d, i) { return colors[i]; });
        
            legendItem.append("text")
                .attr("class", "legend-label")
                .text(function(d) { return Math.round(d); })
                .attr("x", function(d, i) { return i * xScale.rangeBand() })
                .attr("y", 35 + xScale.rangeBand() / 3);
            
            legendItem.exit().remove();
        }
    });
}

function reshapeData(data) {
    return [
        {"type": data["SpellType"], "book": "Sorcerer\'s Stone", "value": Number(data["Sorcerer\'s Stone"])},
        {"type": data["SpellType"], "book": "Chamber of Secrets", "value": Number(data["Chamber of Secrets"])},
        {"type": data["SpellType"], "book": "Prisoner of Azkaban", "value": Number(data["Prisoner of Azkaban"])},
        {"type": data["SpellType"], "book": "Goblet of Fire", "value": Number(data["Goblet of Fire"])},
        {"type": data["SpellType"], "book": "Order of the Phoenix", "value": Number(data["Order of the Phoenix"])},
        {"type": data["SpellType"], "book": "Half Blood Prince", "value": Number(data["Half Blood Prince"])},
        {"type": data["SpellType"], "book": "Deathly Hallows", "value": Number(data["Deathly Hallows"])}
    ];
}

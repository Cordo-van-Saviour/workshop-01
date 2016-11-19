$(function () {

    var DEFAULTS = {
        tick_count: 10,
        x_tick_count: 16,

        top_circle_radius: 6,

        brush_height: 200,

        graph_width: 800,
        graph_height: 500
    };

    var symbol = d3.symbol();
    var DOT_SHAPE = symbol.type(function(d){
      if (d.case_gender === 'MALE') {
        return d3.symbolSquare;
      }

      return d3.symbolCircle;
    });

    var STAGES = [
            'I or II NOS',
            'Not available',
            'Stage 0',
            'Stage I',
            'Stage IA',
            'Stage IB',
            'Stage II',
            'Stage IIA',
            'Stage IIB',
            'Stage IIC',
            'Stage III',
            'Stage IIIA',
            'Stage IIIB',
            'Stage IIIC',
            'Stage IS',
            'Stage IV',
            'Stage IVA',
            'Stage IVB',
            'Stage IVC',
            'Stage Tis',
            'Stage X'
        ];

    var margin = {top: 20, right: 20, bottom: 50, left: 60},
        width = DEFAULTS.graph_width - margin.left - margin.right,
        height = DEFAULTS.graph_height - margin.top - margin.bottom;


        _.forEach(STAGES, function (data) {
            console.log("working....");
            $('.legend-wrapper').append('<input type="checkbox" class="cwite" name="' + data + '">');
            $('.legend-wrapper').append('<label class="cwite" for="' + data + '">' + data + '</label><br>');
        })

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select(".scatter-plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + DEFAULTS.brush_height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var color =  d3.scaleOrdinal(d3.schemeCategory20);
    color.domain(STAGES);

    var y = d3.scaleLinear().range([height, 0]);
    var x = d3.scaleLinear().range([0, width]);
    var xBrush = d3.scaleLinear().range([0, width]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var xBrushAxis = d3.axisBottom(xBrush);

    // GO GO GO :)
    d3.tsv("../tcga-cases.tsv", function(error, data) {
      if (error) throw error;

      x.domain([0, d3.max(data, function (d) {
        return +d.case_days_to_death;
      })]);
      y.domain([0, d3.max(data, function (d) {
        return +d.case_age_at_diagnosis;
      })]);
      xBrush.domain([d3.min(data, function (d) { return +d.case_days_to_death; }), d3.max(data, function (d) { return +d.case_days_to_death; })]);


      svg.append("g")
        .attr("class", "x axis xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Sepal Width (cm)");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Sepal Length (cm)")


        /**
       * Brush
       */

      var brush = d3.select(".scatter-plot svg");

      height = height + 120;

      brush.append("g")
          .attr("class", "axis axis--grid")
          .attr("transform", "translate("+ margin.left +"," + height + ")")
          .call(d3.axisBottom(xBrush)
              .ticks(DEFAULTS.x_tick_count));

      brush.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate("+ margin.left +"," + height + ")")
          .call(d3.axisBottom(xBrush));

      brush.append("g")
          .attr("transform", "translate("+ margin.left +"," + height + ")")
          .attr("class", "brush")
          .call(d3.brushX()
              .extent([[0, -50], [width, 0]])
              .on("end", brushended));



      svg.selectAll(".dot")
        .data(data)
        .enter().append("path")
        .attr("class", "dot")
        .attr("d", DOT_SHAPE)
        .attr("transform", function(d) { return "translate(" + x(d.case_days_to_death) + "," + y(d.case_age_at_diagnosis) + ")"; })
        .style("fill", "none")
        .style("stroke", function(d) {
          return color(d.case_pathologic_stage);
      });


      function brushended() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.

        var selection = d3.event.selection;
        x.domain(selection.map(xBrush.invert, xBrush));

        svg.selectAll(".dot")
          .attr("transform", function (d) {
            var x1 = x(d.case_days_to_death),
                y1 = y(d.case_age_at_diagnosis);

            return "translate(" + x1 + "," + y1 + ")"
          })
          .classed("hide", function(d) {
            var x1 = x(d.case_days_to_death);
            return x1 < 0;
          });

          svg.select(".xaxis").call(xAxis);
      }

      // var legend = svg.selectAll(".legend-wrapper")
      // .data(d3color.domain())
      // .enter().append("g")
      // .attr("class", "legend")
      // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
      //
      // legend.append("rect")
      // .attr("x", width - 18)
      // .attr("width", 18)
      // .attr("height", 18)
      // .style("fill", color);
      //
      // legend.append("text")
      // .attr("x", width - 24)
      // .attr("y", 9)
      // .attr("dy", ".35em")
      // .style("text-anchor", "end")
      // .text(function(d) { return d; });
    });
  })

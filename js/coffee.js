'use strict';
//DEFINE YOUR VARIABLES UP HERE
var chart, vis;
var height = 500;
var width = 900;
var margin = {top: 20, right: 50, bottom: 30, left: 30};

//Gets called when the page is loaded.
function init(){
  chart = d3_v4.select('#vis').append('svg')
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(30,30)");;
  vis = chart.append("g");
  update_worldMap();
  console.log(store);
}

function update_worldMap(){
d3_v4.queue()
  .defer(d3_v4.json, "../data/world-countries.topojson")
  .await(ready);
//function ready(error,data,capitals) {
function ready(error,data) {
  //console.log(data);

  var countries = topojson.feature(data, data.objects.countries1).features
  //console.log(countries)

  var projection = d3_v4.geoMercator()
                     .translate([width/2,height/2])
                     .scale(150)

  var path = d3_v4.geoPath()
  .projection(projection)

  chart.selectAll(".country")
     .data(countries)
     .enter().append("path")
     .attr("class", "country")
     .attr("d",path)
     .on('mouseover', function(d){
       d3_v4.select(this).classed("selected", true)

     })
     .on('mouseout', function(d){
       d3_v4.select(this).classed("selected", false)
     })


       $.ajax({
           url: 'getAllDatayr',
           type:"GET",
           dataType: "json",
           data: {
             startyr:$('#startyr').val(),
             endyr:$('#endyr').val()
           },
           success: function(capitals) {
               //console.log(capitals)
               chart.selectAll(".city-circle").data(capitals)
               .enter().append("circle")
               .attr("r",2)
               .attr("cx",function(d){
                   var coords = projection([d.longitude, d.latitude])
                   //console.log(coords)
                   return coords[0];
               })
               .attr("cy",function(d){
                   var coords = projection([d.longitude, d.latitude])
                   //console.log(coords)
                   return coords[1];
               })
           },
           error: function(jqXHR, textStatus, errorThrown) {
               console.log('error ' + textStatus + " " + errorThrown);
           }
       });

/*
     console.log(capitals)
     chart.selectAll(".city-circle").data(capitals)
     .enter().append("circle")
     .attr("r",2)
     .attr("cx",function(d){
         var coords = projection([d.long, d.lat])
         console.log(coords)
         return coords[0];
     })
     .attr("cy",function(d){
         var coords = projection([d.long, d.lat])
         console.log(coords)
         return coords[1];
     })
     */
}
}

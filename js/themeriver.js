//Reference: http://bl.ocks.org/WillTurman/4631136
//var datearray = [];
//var colorrange = [];

var strokerange,format,strokecolor,margin,width,height,x,y;
var xAxis,yAxis,stack,nest,area,svg,layers;


function updateThemeRiver(){
  $("document").ready(function(){
    $.ajax({
        url: 'getDatayr',
        type:"GET",
        dataType: "json",
        data: {
          startyr:$('#startyr').val(),
          endyr:$('#endyr').val()
        },
        success: function(data) {
          regData=convertJsonTo2dArray(data);
          themecall(regData);

        },
    });
  });
  //end
}


function themeriver() {

//no longer used, code moved to colorHelper.js
//colorrange = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#ff7f00","#6600cc","#66ff99"];
//["#B30000", "#78C679", "#FC8D59", "#FDBB84", "#CC4C02", "#FEF0D9","#980043", "#DD1C77", "#DF65B0", "#02F4C7","#238443","#EFFFFF"];

strokerange = ["FFFFFF"]
strokecolor = strokerange[0];
format = d3.time.format("%m/%d/%Y");
margin = {top: 20, right: 40, bottom: 30, left: 30};
width = document.body.clientWidth - margin.left - margin.right;
height = $('.themeriver').height() - margin.top - margin.bottom;

x = d3.time.scale()
    .range([0, width]);
y = d3.scale.linear()
    .range([height, 0]);

xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years);
yAxis = d3.svg.axis()
    .scale(y);
stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.numEvents; });

//console.log(stack);
nest = d3.nest().key(function(d) {  return d.key; })
area = d3.svg.area()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });
svg = d3.select(".themeriver").append("svg")
    .attr("width", width + margin.left + margin.right)//TODO make sure this width does not affect the arrangements
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

updateThemeRiver();
}

function themecall(data){
  data.forEach(function(d) {
    var mdate = "01/01/"+d.date
    d.date = format.parse(mdate);
    if(isNaN(d.numEvents)){
      d.numEvents=+0;
    }
    else{
    d.numEvents = +d.numEvents;
  }
  });
  //console.log(data);
layers = stack(nest.entries(data));
  //console.log(layers);
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) {
         return getEntityColor(d['key']);
       });
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ", 0)")
      .call(yAxis.orient("right"));
svg.selectAll(".layer")
    .attr("opacity", 1)
    .on("mouseover", function(d, i) {
      svg.selectAll(".layer").transition()
      .attr("opacity", function(d, j) {
        return j != i ? 0.1 : 1;
    })
  //    console.log(d.values);
       var x0 = d3.mouse(this);
       var x1= x.invert(x0[0])
       var xyear=x1.getFullYear();
  //     var xdate="01/01/"+xyear;
   //    var fmat = d3.time.format("%m/%d/%Y").parse;
       //var newxdate=fmat(xyear);
       var mindate=getStartyr();
//       console.log(d);
  //     var y0=Math.round(y.invert(x0[1]))
       //console.log(y0)
                svg.append("text").attr({
               id: "t-abs",  
            })
            .text(function() {
              var yeartoarry=xyear-mindate;
  //            console.log(d.values[yeartoarry].numEvents);
              return [d.key,xyear, d.values[yeartoarry].numEvents];  // Value of the text
            })
    })
    .on("mouseout",function(d,i){
      svg.selectAll(".layer").transition()

      .attr("opacity",1);
      d3.select("#t-abs" ).remove();
    })

}

function convertJsonTo2dArray(data)
{
  var uniqueContinents={};
  for(var i=0;i<data.length;i++)
  {
    //TODO if we dont want this much data then only get only those data that is needed
    data[i]['key']=data[i]._id.continent;
    uniqueContinents[data[i]._id.continent]=true;
    data[i]['date']=data[i]._id.year;
    delete data[i]['_id'];
    delete data[i]['nkill'];
    delete data[i]['nperps'];
    delete data[i]['nkillter'];
    delete data[i]['nwound'];
    //delete data[i]['__proto__'];
  }
  updateEntity(uniqueContinents);
 // console.log(data);
  assigneddata=assignmissing(data);
  return assigneddata;
}

//Reference: http://stackoverflow.com/questions/14713503/how-to-handle-layers-with-missing-data-points-in-d3-layout-stack
function assignmissing(dataset)
{
  var defaultValue=0;
  var uniquekeys =  d3.nest()
  .key(function(d) { return d.key; })
  .entries(dataset);
  var uniquekis=[]
  uniquekeys.forEach(function(row){
    uniquekis.push(row.key)
  });
//  console.log(uniquekeys);
//  console.log(uniquekis.length);
  var keys = uniquekis.sort(sortByNames);
//  console.log(keys);
    var newData = [];
    var sortByDate = function(a,b){
       return d3.ascending(a.date, b.date) ||d3.ascending(a.key, b.key);}
      //console.log(a); console.log(a.date);
       //console.log(b); console.log(b.date);
        //return a.date > b.date ? 1 : -1; };
    dataset.sort(sortByDate);
    //console.log(dataset);
    //var sortByName = function(a,b){
    //  if((a.key >= b.key) && (a.date>=b.date)){ return 1; }
    //  else {return -1;}
    //};
    var sortByNames= function(a,b){
      return d3.ascending(a,b);
    }
    var startingyear = dataset[0].date;
    //dataset.sort(sortByName);
    console.log("Fixing missing data");
    var iyear=startingyear;
    var j=0;
   dataset.forEach(function(row){
      //console.log(row.key);
      //console.log(keys[j]);
      while(row.key!=keys[j]){
        newData.push( { key: keys[j],
          numEvents: +defaultValue,
          date: iyear })
        j=j+1;
        if(j==uniquekis.length){
          j=0;
          iyear=iyear+1;
        }
      }
      j=j+1;
      if(j==uniquekis.length){
        j=0;
        iyear=iyear+1;
      }
    });
    console.log("Fixed Missing data");
    return dataset.concat(newData).sort(sortByDate);
}

function clearThemeRiver()
{
  console.log("Clearing");
  svg.remove();
}

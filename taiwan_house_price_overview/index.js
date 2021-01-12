const urlParams = new URLSearchParams(window.location.search);
var filename = '0years_median_house_price.json';
var globalData = null;
function selectOnChange(){
    var ob = document.getElementById("sel");
    var name = ob.options[ob.selectedIndex].value;
  if(document.getElementById('checkBox').checked){
    urlParams.set('filename', name + 'years_median_house_price_with_ratio.json');
  }else{
    urlParams.set('filename', name + 'years_median_house_price.json');
  }
  urlParams.set('country', country);
  window.location.search = urlParams;
}
if(urlParams.get("filename")){
  filename = urlParams.get("filename");
}
function selRowOnchange(){
    var ob = document.getElementById("selRow");
    var name = ob.options[ob.selectedIndex].value;
  urlParams.set('maxrow', name);
  urlParams.set('country', country);
  window.location.search = urlParams;
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
function buttonOnClick(position){
      for(var i=0;i<country.length;i++){
        var tmp = country[i];
        throwCity('update', tmp, cityColor[tmp]);
      }
      if(position == 'N'){
        country = country.concat(Object.keys(cityColor).slice(0, 7));
      }else if(position == 'M'){
        country = country.concat(Object.keys(cityColor).slice(7, 12));
      }else if(position == 'S'){
        country = country.concat(Object.keys(cityColor).slice(12, 17));
      }else if(position == 'E'){
        country = country.concat(Object.keys(cityColor).slice(17, 19));
      }else if(position == 'total'){
        country = Object.keys(cityColor);
      }
      country = country.filter(onlyUnique);

      d3.selectAll('.line').remove();
      d3.selectAll('.line-text').remove();
      minHousePrice = 1000000000;
      maxHousePrice = 0;
      for(var i=0; i<country.length;i++){
        if(country[i] === 0){
          continue;
        }
        var tmp = country[i];
        xaxis.forEach(function(element){ 
          if(globalData[element][tmp][tmp] > maxHousePrice){
            maxHousePrice = globalData[element][tmp][tmp];
          }
          if(globalData[element][tmp][tmp] < minHousePrice){
            minHousePrice = globalData[element][tmp][tmp];
          }})
      }
      rescale();
      var valueline = [];
      for(var i=0; i<country.length;i++){
        if(country[i] === 0){
          valueline.push(0);
          continue;
        }
        var tmp = country[i];
        d3.select('#'+tmp).style('fill', cityColor[tmp]);
        valueline.push(d3.line()
        .x(function(d) { return x(xaxis[d]);  })
        .y(function(d) { return y(globalData[xaxis[d]][tmp][tmp]); }))
      
      svg.append("path")
        .data([countrydata])
        .attr("class", "line " + tmp)
        .style("stroke", cityColor[tmp])
        .attr("d", valueline[i])
        .call(hover)
        .call(transition)
        .lower();
      
      svg.append("text")
        .attr("class", "line-text " + tmp)
        .attr("transform", "translate(" + (width+2) + "," + y(globalData[109][tmp][tmp]) + ")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", cityColor[tmp])
        .text(tmp)
        .call(hover);
      throwCity('update', tmp, cityColor[tmp]);
      };

}
// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 30, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var xaxis = [102, 103, 104, 105, 106, 107, 108, 109];
var cityColor = {
  '臺北市': '#8CABD9',
  '新北市': '#F6A7B8',
  '基隆市': '#1D4D9F',
  '桃園市': '#F08838',
  '新竹市': '#C11432',
  '新竹縣': '#009ADA', 
  '宜蘭縣': '#66A64F',
  '苗栗縣': '#3A488A',
  '臺中市': '#8785B2',
  '彰化縣': '#DABD61',
  '雲林縣': '#D95F30',
  '南投縣': '#BD748F',
  '嘉義縣': '#2C6AA5',
  '嘉義市': '#D9AE2C',
  '臺南市': '#D88C27',
  '高雄市': '#64894D',
  '屏東縣': '#59A55D',
  '花蓮縣': '#6E6352',
  '臺東縣': '#145CBF'
};

var country = ["新竹市"];
if(urlParams.get("country")){
  country = urlParams.get("country").split(",");
}
var countrydata = [];
var minHousePrice = 100000000;
var maxHousePrice = 0;
for (i = 0; i < xaxis.length; i++) {
  countrydata.push(i);
}

var svg = d3.select("body").append("svg").attr("class", "line-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function rescale() {
    y.domain([minHousePrice*0.99, maxHousePrice*1.01])  // change scale to 0, to between 10 and 100
    svg.select(".yaxis")
            //.transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
            .call(d3.axisLeft(y));  
}
function transition(path) {
    path.transition()
        .duration(750)
        .attrTween("stroke-dasharray", tweenDash);
}
function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t); };
}
function hover() {
  if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchend", left)
  else svg
      .on("mousemove", moved)
      .on("mouseleave", left);
  const lines = d3.selectAll(".line");
  const texts = d3.selectAll(".line-text");
  //console.log(lines.filter(".新竹市"));
  // 滑鼠在畫布中移動
  function moved() {
    d3.event.preventDefault();
    const pointer = d3.mouse(this);
    const mouseXIndex = Math.round(x.invert(pointer[0]));
    const mouseYIndex = y.invert(pointer[1]);
    // find min index
    var index = null;
    var min = null;
    country.forEach(function(d){
      diff = Math.abs(globalData[mouseXIndex][d][d] - mouseYIndex)
      if(index == null) {
        index = d;
        min = diff;
      }
      else {
        if(diff < min) {
          index = d;
        	min = diff;
        }
      }
    })
    country.forEach(function(d){
      //console.log(cityColor[d]);
      if(d != index) {
        lines.filter("." + d)
        	.style("stroke", "#ddd")
            .lower();
        texts.filter("." + d)
        	.style("fill", "#ddd")
        	.style("font-weight", "normal")
            .lower();
      }
      else{
        lines.filter("." + d)
        	.style("stroke", cityColor[d])
            .raise();
        texts.filter("." + d)
        	.style("fill", cityColor[d])
        	.style("font-weight", "bold")
        	.raise();
      }
    });
  }
  // 滑鼠離開畫布
  function left() {
    country.forEach(function(d){
    	lines.filter("." + d)
      	    .style("stroke", cityColor[d])
            .lower();
      texts.filter("." + d)
        .style("fill", cityColor[d])
      	.style("font-weight", "normal")
        .lower();
    });
  }
}
d3.json(filename, function(data) { 
  globalData = data;
  // if (error) break;
  //console.log(data["102"]);
  //console.log(data["102"]["新竹市"]["新竹市"]);
  minHousePrice = data["102"]["新竹市"]["新竹市"];
  maxHousePrice = data["109"]["新竹市"]["新竹市"];
  var vm = new Vue({
    el: "#app",
    data: {
      filter: "",
      data: data
    },
    computed:{
      now_area: function(){
        var vobj=this;
        // console.log(vobj.filter)
        // var result=Object.keys(data).filter(function(obj){
        //   console.log(obj, data[obj])
        //   return obj==vobj.filter;
        // });
        result = {"country": vobj.filter};
        //console.log(result);
        return result;
      }
    }
  });
  
  $("path").mouseup(function(e){

    var tagname=$(this).attr("data-name");
    vm.filter=tagname;
    if(country.find(element => element === tagname) === undefined){

      xaxis.forEach(function(element){ 
        if(data[element][tagname][tagname] > maxHousePrice){
          maxHousePrice = data[element][tagname][tagname];
        }
        if(data[element][tagname][tagname] < minHousePrice){
          minHousePrice = data[element][tagname][tagname];
        }})
      
      country.push(tagname);
      d3.select(this).style('fill', cityColor[tagname]);
    }else{
      const index = country.indexOf(tagname);
      if (index > -1) {
          country.splice(index, 1);
          d3.select(this).style('fill', 'white');
      }
    }
      d3.selectAll('.line').remove();
      d3.selectAll('.line-text').remove();
      minHousePrice = 1000000000;
      maxHousePrice = 0;
      for(var i=0; i<country.length;i++){
        if(country[i] === 0){
          continue;
        }
        var tmp = country[i];
        xaxis.forEach(function(element){ 
          if(data[element][tmp][tmp] > maxHousePrice){
            maxHousePrice = data[element][tmp][tmp];
          }
          if(data[element][tmp][tmp] < minHousePrice){
            minHousePrice = data[element][tmp][tmp];
          }})
      }
      rescale();
      var valueline = [];
      for(var i=0; i<country.length;i++){
        if(country[i] === 0){
          valueline.push(0);
          continue;
        }
        var tmp = country[i];
        valueline.push(d3.line()
        .x(function(d) { return x(xaxis[d]);  })
        .y(function(d) { return y(data[xaxis[d]][tmp][tmp]); }))
     
      svg.append("path")
        .data([countrydata])
        .attr("class", "line " + tmp)
        .style("stroke", cityColor[tmp])
        .attr("d", valueline[i])
        .call(hover)
        .call(transition)
        .lower();
      svg.append("text")
        .attr("class", "line-text " + tmp)
        .attr("transform", "translate(" + (width+2) + "," + y(data[109][tmp][tmp]) + ")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", cityColor[tmp])
        .text(tmp)
        .call(hover);
      };
      
      throwCity('update', tagname, cityColor[tmp]);

  });
  

  // Scale the range of the data
  
  x.domain(d3.extent(xaxis, function(d) { return d; }));
  y.domain([data["102"]["新竹市"]["新竹市"], data["109"]["新竹市"]["新竹市"]]);
  minHousePrice = 1000000000;
  maxHousePrice = 0;
  for(var i=0; i<country.length;i++){
    if(country[i] == 0){
      continue;
    }
    var tmp = country[i];
    xaxis.forEach(function(element){ 
      if(data[element][tmp][tmp] > maxHousePrice){
        maxHousePrice = data[element][tmp][tmp];
      }
      if(data[element][tmp][tmp] < minHousePrice){
        minHousePrice = data[element][tmp][tmp];
      }})
  }
  rescale();
  // y.domain([102, 109]);
  vm.filter="新竹市";
  var valueline = [];
  for (i = 0; i < country.length; i++) {
    var tmp = country[i];
    valueline.push(d3.line()
    .x(function(d) { return x(xaxis[d]);  })
    .y(function(d) { return y(data[xaxis[d]][country[i]][country[i]]); }));
    svg.append("path")
      .data([countrydata])
      .attr("class", "line " + tmp)
      .style("stroke", cityColor[country[i]])
      .attr("d", valueline[i])
    	.call(hover)
      .call(transition)
      .lower();
    
    svg.append("text")
      .attr("class", "line-text " + tmp)
      .attr("transform", "translate(" + (width+2) + "," + y(data[109][country[i]][country[i]]) + ")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", cityColor[country[i]])
      .text(country[i])
    	.call(hover);
      d3.select('#'+tmp).style('fill', cityColor[country[i]]);
  }
  var points = svg.selectAll('.points')
    .data([countrydata])
    .enter()
    .append('g')
    .attr('class', 'points')
    .append('text');
  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(8));

  // Add the Y Axis
  svg.append("g")
      .attr("class", "yaxis")
      .call(d3.axisLeft(y));
  if(urlParams.get("filename")){
    var temp = urlParams.get("filename")[0];
    var mySelect = document.getElementById('sel');

    for(var i, j = 0; i = mySelect.options[j]; j++) {
        if(i.value == temp) {
            mySelect.selectedIndex = j;
            break;
        }
    }
    if(urlParams.get("filename").includes('_with_ratio')){
      d3.select('#checkBox').attr("checked", true);
    }
  }
  if(urlParams.get("maxrow")){
    var temp = urlParams.get("maxrow");
    var mySelect = document.getElementById('selRow');
    for(var i, j = 0; i = mySelect.options[j]; j++) {
        if(i.value == temp) {
            mySelect.selectedIndex = j;
            break;
        }
    }
  }
  const tooltip = d3.select('#tooltip');

  var focus = svg.append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1' , 0)
    .attr('y2', height);

  svg.append('rect')
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove);
  
  // var timeScales = d3.extent(xaxis, function(d) { return d; });
  var timeScales = [];
  var lastAxisNum;
  xaxis.forEach(function(d) {
    if(d != 102) {
    	timeScales.push((x(lastAxisNum) + x(d)) / 2);
    }
    lastAxisNum = d;
  });
  
  function mouseover() {
    focus.style("display", null);
    //d3.selectAll('.points text').style("display", null);
  }
  function mouseout() {
    focus.style("display", "none");
    //d3.selectAll('.points text').style("display", "none");
    if (tooltip) tooltip.style('display', 'none');
  }
  
  function mousemove() {
    var i = d3.bisect(timeScales, d3.mouse(this)[0]);
    var di = data[xaxis[i]];
    var countrytotal = [];
    for (j = 0; j < country.length; j++) {
      countrytotal.push({name: country[j], money: data[xaxis[i]][country[j]][country[j]]});
    }
    countrytotal.sort(function(a,b){ return b.money-a.money});
    // console.log(x(xaxis[i-1]))
    // focus
    //   .data(countrytotal)
    // 	.append("circle")
    //   .attr("r", 5)
    //   .attr("fill", color[i-1])
    //   .attr("cx", function(d) {console.log(x(xaxis[i-1])); return (x(xaxis[i-1]));})
    //   .attr("cy", function(d) {console.log(d); return y(d.money);})
    //   .attr("opacity", 1);
    focus.attr("transform", "translate(" + x(xaxis[i]) + ",0)");
    var unitOfPrice = "元/坪";
    if(urlParams.get("filename") && urlParams.get("filename").includes('_with_ratio')){
      unitOfPrice = '%';
    }
    var offsetX;
    if(i >= 6)
      offsetX = -260;
    else
      offsetX = 50;
    
    const pointer = d3.mouse(this);
    const mouseXIndex = Math.round(x.invert(pointer[0]));
    const mouseYIndex = y.invert(pointer[1]);
    // find min index
    var index = null;
    var min = null;
    var circleIndex = null;
    countrytotal.forEach(function(d, i){
      diff = Math.abs(d.money - mouseYIndex)
      if(index == null) {
        index = d.name;
        min = diff;
        circleIndex = i;
      }
      else {
        if(diff < min) {
          index = d.name;
        	min = diff;
          circleIndex = i;
        }
      }
    })
    tooltip.html("民國： " + xaxis[i] + "年")
      .style('display', 'block')
      .style('font-weight', 'bold')
      .style('font-size','20px')
      .style('left', d3.event.pageX + offsetX + "px")
      .style('top', d3.event.pageY - 22*circleIndex + "px")
      .selectAll()
      .data(countrytotal).enter()
      .append('div')
    	.attr("class", d => "tooltip " + d.name)
      .style('color', d => d.name == index ? cityColor[d.name] : "#000")
      .html(d => d.name + '：' + Math.round(d.money) + unitOfPrice);

		 var circles = focus.selectAll(".hoverCircle")
			.data(countrytotal)
      circles
        .enter()
        .append("circle")
        .attr("class", "hoverCircle")
        .attr("r", d => d.name == index ? 7 : 0)
    		.attr("cy", d => y(d.money))
				.attr("cx", d => 0);
    	circles
    		.attr("r", d => d.name == index ? 7 : 0)
				.attr("cy", d => y(d.money))
				.attr("cx", d => 0);
    	circles
      	.exit()
    		.attr("r", 0)
    		.remove();
    }
})


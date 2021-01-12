////// 按鈕 //////
// 畫按鈕

var filename = '3years_median_house_price.json';
if(urlParams.get("filename")){
  filename = urlParams.get("filename");
}
var renderData = []; // 存要看的city data
var interval = null;  // 設置一個變數來跑動畫
function change() {
  // 播放按鈕
  var checkBox = document.getElementById('playpause');
  //console.log(checkBox.checked);
  checkBox.addEventListener('click', function() {
    if(checkBox.checked == true && renderData.length > 0) {
        // 跑動畫
        interval = setInterval(function() {
          update();
        }, tickDuration);
      }
      else {
        // 動畫暫停，清除interval
        if (interval)
          clearInterval(interval);
      }
  });
};
////// 資料處理 //////
// 資料預處理
function preProcess(city='新竹市') {
  var years = d3.keys(rowData);
  var ret = [];
  var lastValue = {};
  years.forEach(function(year){
    var names = d3.keys(rowData[year][city]);
    names.sort(function(a, b) { return rowData[year][city][b] - rowData[year][city][a] });
    var rank = 0;
    names.forEach(function(name) {
      if(name != city || names.length == 1){
        var item = {};
        item.year = +year;
        item.city = city;
        item.name = name;
        item.value = +rowData[year][city][name];
        if(item.value == -999) {
          if(lastValue[name] == undefined)
            lastValue[name] = item.value = 0;
          else
            item.value = lastValue[name];
        }
        else
          lastValue[name] = item.value;
        item.color = '#aaa';
        ret.push(item);
        rank += 1;
      }
    });
  });
  return ret;
};
/////// update function ///////
// 加要看的city data
function addData(city, color) {
  var data = preProcess(city);
  data.forEach(function(d) {
    d.color = color;
    renderData.push(d);
  });
};
// 刪除不要看的資料
function removeData(city) {
  var start = null;
  var count = 0;
  for(var i = 0; i < renderData.length; i++) {
    if(start == null && renderData[i].city == city)
      start = i;
    if(renderData[i].city == city)
      count += 1;
  }
  renderData.splice(start, count);
};
// 從地圖收到點擊資料
var cityRecord = [];
function throwCity(type, city='新竹市', color='#C11432'){
  var recordCheck = false;
  
  for(var i = 0; i < cityRecord.length; i++) {
    if(city == cityRecord[i]) {
      removeData(city);
      recordCheck = true;
      cityRecord.splice(i, 1);
      break;
    }
  }
  console.log(recordCheck);
  if(recordCheck == false) {
  	addData(city, color);
    cityRecord.push(city);
  }
  console.log(cityRecord);
  if(type == 'update')
  	update('reset');
};
// 動畫函式
function update(type='update') {
  // 更新rank
  var rank = 0;
  rankedYear = renderData
    .filter(d => d.year == year)
  	.sort(function(a, b) {
      return b.value - a.value;
    })
    .slice(0, maxRows);
  rankedYear.forEach(function(d) {
    d.rank = rank;
    rank += 1;
  });
  // 更新X的範圍
  if(rankedYear.length > 0)
    chartX.domain([0, rankedYear[0].value]);
  else
    chartX.domain([0, 0]);
  // 重新畫X軸
  chartSvg.select('.xAxis')
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .call(xAxis);
  // 更新bar
  var bars = chartSvg.selectAll('.bar')
  	.data(rankedYear, d => d.name);
  
  bars
    .enter()
    .append('rect')
    .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
    .attr('x', chartX(0))
    .attr('width', d => chartX(d.value) - chartX(0))
    .attr('y', d => chartY(maxRows))
    .attr('height', chartY.bandwidth())
    .style('fill', d => d.color)
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('y', d => chartY(d.rank));
   bars
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => chartX(d.value) - chartX(0))
    .attr('y', d => chartY(d.rank)).style('fill', d => d.color);
   bars
    .exit()
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => chartX(d.value) - chartX(0))
    .attr('y', d => chartY(maxRows))
    .remove();
  
  // 更新區域文字
  var labels = chartSvg.selectAll('.label')
      .data(rankedYear, d => d.name);
  
  labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => chartX(d.value) - 15)
    .attr('y', d => chartY(maxRows) + chartY.bandwidth() / 2 + 5)
    .style('text-anchor', 'end')
    .html(d => d.name)    
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5);
  labels
    .transition()
    .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => chartX(d.value) - 15)
      .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5);
  labels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => chartX(d.value) - 15)
      .attr('y', d => chartY(maxRows) + chartY.bandwidth() / 2 + 5)
      .remove();
  
  // 更新價格文字
  var valueLabels = chartSvg.selectAll('.valueLabel')
  	.data(rankedYear, d => d.name);
  
  valueLabels
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => chartX(d.value) + 15)
    .attr('y', d => chartY(maxRows) + chartY.bandwidth() / 2 + 5)
    .text(d => d3.format(',.0f')(d.value))
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5);
  valueLabels
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('x', d => chartX(d.value) + 15)
    .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5)
    .text(d => d3.format(',.0f')(d.value))
  valueLabels
    .exit()
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('x', d => chartX(d.value) + 15)
    .attr('y', d => chartY(maxRows) + chartY.bandwidth() / 2 + 5)
    .remove();
  // 更新右下角年的文字
  yearText.html(~~year);
  year += 1;
  // 停止條件
  if(year == 110)
    type = 'reset';
  if(type == 'reset') {
    // 初始化
    clearInterval(interval);
    document.getElementById('playpause').checked = false; 
    year = 102;
  }
}
////// main //////
// data相關
var rowData;
var year;
var rankedYear;
// 畫布相關
var maxRows = 12;  // 最多可顯示12個rows
if(urlParams.get('maxrow')){
  maxRows = parseInt(urlParams.get('maxrow'));
}
const chartHeight = 600;
const chartWidth =1080;
const chartMargin = {top: 30, right: 140, bottom: 0, left: 5};
const barSize = Math.round(chartHeight / maxRows);  // bar的高度
const tickDuration = 1250;  // 變化時間(毫秒)
var chartSvg;
var chartX, chartY, xAxis, yearText;
var playButton; // 播放按鈕
d3.json(filename, function(d) {
  // 用全域變數紀錄資料
  rowData = d;
  // 建立畫布
  chartSvg = d3.select('#barChart')
    .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
  
  // 設置按鈕
  change();
  // 預處理
  var rank = 0;
  //var data = preProcess(); 
  throwCity('initial');
  year = 102;
  rankedYear = renderData
    .filter(d => d.year == year)
  	.sort(function(a, b) {
      return b.value - a.value;
    })
    .slice(0, maxRows);
  rankedYear.forEach(function(d){
    d.rank = rank;
    rank += 1;
  });
  // 拿到X，Y軸資訊
  chartX = d3.scaleLinear()
    .domain([0, d3.max(rankedYear, d => d.value)])
    .range([chartMargin.left, chartWidth - chartMargin.right]);
  chartY = d3.scaleBand()
    .domain(d3.range(maxRows + 1))
    .range([chartMargin.top, barSize * (maxRows + 1) - chartMargin.bottom])
  	.padding(0.1);
  xAxis = d3.axisTop()
    .scale(chartX)
    .ticks(chartWidth > 500 ? 5 : 2)
    .tickSize(-chartHeight)
    .tickFormat(d => d3.format(',')(d));
  // 畫X軸
  chartSvg.append('g')
    .attr('class', 'axis xAxis')
    .attr('transform', `translate(0, ${chartMargin.top})`)
    .call(xAxis)
    .selectAll('.tick line')
    .classed('origin', d => d == 0);
  // 畫bar
  chartSvg.selectAll('rect.bar')
    .data(rankedYear, d => d.name)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', chartX(0))
    .attr('width', d => chartX(d.value) - chartX(0))
    .attr('y', d => chartY(d.rank))
    .attr('height', chartY.bandwidth())
    .style('fill', d => d.color);
  // 畫區域名字
  chartSvg.selectAll('text.label')
    .data(rankedYear, d => d.name)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => chartX(d.value) - 15)
    .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5)
    .style('text-anchor', 'end')
    .style('font-weight', 'bold')
    .html(d => d.name);
	// 畫價格
  chartSvg.selectAll('text.valueLabel')
    .data(rankedYear, d => d.name)
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => chartX(d.value) + 15)
    .attr('y', d => chartY(d.rank) + chartY.bandwidth() / 2 + 5)
    .text(d => d3.format(',.0f')(d.value));
  // 年的字變換
	const changeYear = function(text, strokeWidth) {
    text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#ffffff')
      .style( 'stroke','#ffffff')
      .style('stroke-width', strokeWidth)
      .style('stroke-linejoin', 'round')
      .style('opacity', 1);
  };
  // 畫右下角的年
  yearText = chartSvg.append('text')
    .attr('class', 'yearText')
    .attr('x', chartWidth)
    .attr('y', chartHeight - 25)
    .style('text-anchor', 'end')
    .html(~~year)
    .call(changeYear, 10);
  if(urlParams.get("country")){
    var country = urlParams.get("country").split(",");
    throwCity('update');
    for(var i=0;i<country.length;i++){
      throwCity('update', country[i], cityColor[country[i]]);
    }
  }
});
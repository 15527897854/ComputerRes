var diskUsage;
var cpus;
function getData(series,flag) {
    var xmlhttp;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            var jsonResult = eval('(' + xmlhttp.responseText + ')');
            if (flag == 1){
                var usedSpace = parseFloat(jsonResult.totalmem) - parseFloat(jsonResult.freemem);
                var percent = usedSpace/parseFloat(jsonResult.totalmem)*100;
                var x = (new Date()).getTime(), // 当前时间
                    y =  percent;
                series.addPoint([x, y], true, true);
            }
            else if(flag == 2){
                var stringInfo = "主机名："+
                    jsonResult.hostname+"    系统类型："+jsonResult.systemtype+"    发布版本："+jsonResult.release;
                document.getElementById("data").innerHTML=stringInfo;

                diskUsage = [];
                cpus = jsonResult.cpus;
                var percent,i,j;
                var diskInfo = jsonResult.disk;
                for(i=0;i<diskInfo.length;i++){
                    var partDisk = diskInfo[i].split(':');
                    var ele = partDisk[1].split(' ');
                    // alert(ele);
                    var space = [];
                    for(j=0;j<ele.length;j++){
                        if ((+ele[j])){
                            space.push(+ele[j]);
                        }
                    }
                    // var str = (100-50/(diskInfo.length-1)*i)+"%";
                    percent = (+space[1]-space[0])/(+space[1])*100;
                    diskUsage.push((Math.round(percent)));
                }
                drawPie();
                drawCPUs();
            }
        }
    }
    if (flag == 1){
        setInterval(function (){
            xmlhttp.open("GET","/json/status",true);
            xmlhttp.send();
        },1000);
    }
    else if(flag == 2){
        setInterval(function (){
            xmlhttp.open("GET","/json/status",true);
            xmlhttp.send();
        },1000);
    }
}

var chart;
$(function drawDynamicLine() {
    // getData();
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_line1', //图表放置的容器，DIV
            defaultSeriesType: 'areaspline', //图表类型为曲线图
            events: {
                load: function() {
                    var series = this.series[0];
                    getData(series,1);
                }
            }
        },
        title: {
            text: '内存使用记录'  //图表标题
        },
        xAxis: { //设置X轴
            title:{text:'time'},
            type: 'datetime',  //X轴为日期时间类型
            tickPixelInterval: 100  //X轴标签间隔
        },
        yAxis: { //设置Y轴
            title:{text:'%'},
            tickPixelInterval: 50,
            max: 100, //Y轴最大值
            min: 0  //Y轴最小值
        },
        tooltip: {//当鼠标悬置数据点时的提示框
            formatter: function() { //格式化提示信息
                return '内存使用率'+
                    Highcharts.dateFormat('%H:%M:%S', this.x) +' ：'+
                    Highcharts.numberFormat(this.y, 2)+'%';
            }
        },
        legend: {
            enabled: false  //设置图例不可见
        },
        exporting: {
            enabled: true  //设置导出按钮不可用
        },
        credits: {
            enabled: false,
            text: 'Helloweba.com', //设置LOGO区文字
            url: 'http://www.helloweba.com' //设置LOGO链接地址
        },
        plotOptions:{
            areaspline: {
                fillOpacity: 0.3,
                pointStart: 1940,
//                        color: '#923590',
                marker: {
                    enabled: false,
                    symbol: 'circle',   //点形状
                    radius: 2,  //点半径
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            data: (function() { //设置默认数据，
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -180; i <= 0; i++) {
                    data.push({
                        x: time + i * 1000,
                        y: -5
                    });
                }
                return data;
            })()
        }]
    });
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
});

function drawPie() {
    Highcharts.chart('chart_line2', {
            chart: {
                type: 'solidgauge',
                marginTop: 50
            },

            title: {
                text: '硬盘使用情况',
                style: {
                    fontSize: '24px'
                }
            },

            tooltip: {
                borderWidth: 0,
                backgroundColor: 'none',
                shadow: false,
                style: {
                    fontSize: '16px'
                },
                pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
                positioner: function (labelWidth, labelHeight) {
                    return {
                        x: 200 - labelWidth / 2,
                        y: 180
                    };
                }
            },

            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },

            credits: {
                enabled: false
            },

            plotOptions: {
                solidgauge: {
                    borderWidth: '21px',   //圆环宽度
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false
                }
            },

            //圆环个数、样式
            pane: (function () {
                var pane = {},
                    width = 15,
                    startPer = 40,
                    i;
                pane.startAngle = 0;
                pane.endAngle = 360;
                pane.background = [];
                for(i = diskUsage.length-1;i>=0;i--){
                    pane.background[i] = {
                        outerRadius: startPer+width+"%",
                        innerRadius: startPer+"%",
                        backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[i]).setOpacity(0.15).get(),
                        borderWidth: 0
                    }
                    startPer = startPer+width+1;
                }
                return pane;
            })(),
            // {
            //     startAngle: 0,
            //     endAngle: 360,
            //     background: [{ // Track for Move
            //         outerRadius: '112%',
            //         innerRadius: '88%',
            //         backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.3).get(),
            //         borderWidth: 0
            //     }, { // Track for Exercise
            //         outerRadius: '87%',
            //         innerRadius: '63%',
            //         backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0.3).get(),
            //         borderWidth: 0
            //     }, { // Track for Stand
            //         outerRadius: '62%',
            //         innerRadius: '38%',
            //         backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0.3).get(),
            //         borderWidth: 0
            //     }, { // Track for Stand
            //         outerRadius: '37%',
            //         innerRadius: '25%',
            //         backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0.3).get(),
            //         borderWidth: 0
            //     }]
            // },

            series:(function() {
                var series = [];
                var i,
                    width = 15,
                    startPer = 47.5;
                for(i = 0;i<diskUsage.length;i++){
                    // var str = (100-50/(diskUsage.length-1)*i)+"%";
                    series[i] = {
                        name:String.fromCharCode(+"C".charCodeAt()+i),
                        borderColor:Highcharts.getOptions().colors[i],
                        data:[{
                            color: Highcharts.getOptions().colors[i],
                            radius: startPer+"%",
                            innerRadius: startPer+"%",
                            y: diskUsage[i]
                        }]
                    }
                    startPer = startPer+width+1;
                }
                return series;
            })()
        },
        function callback() {
            // this.renderer.text('C', 190, 90)
            //     .css({
            //         color: '#000',
            //         fontSize: '16px'
            //     })
            //     .add(this.series[1].group);
        });
}

function convertToArray() {
    var i,j,
        result = [];
    for(i = 0;i<5;i++) {
        result[i] = [];
    }
    for(j=0;j<cpus.length;j++){
        result[0].push(cpus[j].times.user);
    }
    for(j=0;j<cpus.length;j++){
        result[1].push(cpus[j].times.nice);
    }
    for(j=0;j<cpus.length;j++){
        result[2].push(cpus[j].times.sys);
    }
    for(j=0;j<cpus.length;j++){
        result[3].push(cpus[j].times.idle);
    }
    for(j=0;j<cpus.length;j++){
        result[4].push(cpus[j].times.irq);
    }
    for(i=0;i<cpus.length;i++){
        var sum = 0;
        for(j=0;j<5;j++){
            sum += result[j][i];
        }
        for(j=0;j<5;j++){
            result[j][i] = Math.round(result[j][i]/sum*100);
        }
    }
    return result;
}

function drawCPUs() {
    Highcharts.chart('chart_line3',{
        chart: {
            type: 'bar'
        },
        title: {
            text: 'CPUs Info'
        },
        xAxis: (function () {
            var num = cpus.length,
                i,
                categories = [];
            for(i=0;i<num;i++){
                categories.push("core"+i);
            }
            return {categories:categories};
        })(),

        yAxis: {
            min: 0,
            max:100,
            title: {
                text: 'Percent %'
            }
        },
        legend: {
            reversed: true
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                    style: {
                        textShadow: '0 0 3px white'
                    }
                }
            }
        },
        series: (function () {
            var times = ["user","nice","sys","idle","irq"];
            var arrayData = convertToArray();
            var k,
                results = [];
            for(k=0;k<5;k++){
                results.push({
                    name:times[k],
                    data:arrayData[k]
                });
            }
            return results;
        })()
    },null)
}

getData(null, 2);
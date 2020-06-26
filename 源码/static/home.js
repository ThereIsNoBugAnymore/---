var step = 0;

// var centerData = [{ "x": 14.2, "y": 13.1 }]
// var pointData = [{ "x": 12.8, "y": 8.8, "amount": 0.1 }, { "x": 18.4, "y": 3.4, "amount": 0.4 }, { "x": 15.4, "y": 16.6, "amount": 1.2 }, { "x": 18.9, "y": 15.2, "amount": 1.5 }, { "x": 15.5, "y": 11.6, "amount": 0.8 }, { "x": 3.9, "y": 10.6, "amount": 1.3 }, { "x": 10.6, "y": 7.6, "amount": 1.7 }, { "x": 8.6, "y": 8.4, "amount": 0.6 }, { "x": 12.5, "y": 2.1, "amount": 1.2 }, { "x": 13.8, "y": 5.2, "amount": 0.4 }, { "x": 6.7, "y": 16.9, "amount": 0.9 }, { "x": 14.8, "y": 2.6, "amount": 1.3 }, { "x": 1.8, "y": 8.7, "amount": 1.3 }, { "x": 17.1, "y": 11.0, "amount": 1.9 }, { "x": 7.4, "y": 1.0, "amount": 1.7 }, { "x": 0.2, "y": 2.8, "amount": 1.1 }, { "x": 11.9, "y": 19.8, "amount": 1.5 }, { "x": 13.2, "y": 15.1, "amount": 1.6 }, { "x": 6.4, "y": 5.6, "amount": 1.7 }, { "x": 9.6, "y": 14.8, "amount": 1.5 }];
// var carData = [{ "distance": 35, "amount": 6 }, { "distance": 50, "amount": 8 }]
// var result = [{ "color": "red", "carid": 1, "route": [{ "x": 14.2, "y": 13.1 }, { "x": 15.5, "y": 11.6, "amount": 0.8 }, { "x": 18.4, "y": 3.4, "amount": 0.4 }, { "x": 14.8, "y": 2.6, "amount": 1.3 }, { "x": 12.5, "y": 2.1, "amount": 1.2 }, { "x": 13.8, "y": 5.2, "amount": 0.4 }, { "x": 10.6, "y": 7.6, "amount": 1.7 }, { "x": 8.6, "y": 8.4, "amount": 0.6 }, { "x": 12.8, "y": 8.8, "amount": 0.1 }, { "x": 9.6, "y": 14.8, "amount": 1.5 }] }, { "color": "yellow", "carid": 1, "route": [{ "x": 14.2, "y": 13.1 }, { "x": 17.1, "y": 11.0, "amount": 1.9 }, { "x": 18.9, "y": 15.2, "amount": 1.5 }, { "x": 15.4, "y": 16.6, "amount": 1.2 }, { "x": 13.2, "y": 15.1, "amount": 1.6 }, { "x": 11.9, "y": 19.8, "amount": 1.5 }] }, { "color": "blue", "carid": 1, "route": [{ "x": 14.2, "y": 13.1 }, { "x": 6.7, "y": 16.9, "amount": 0.9 }, { "x": 3.9, "y": 10.6, "amount": 1.3 }, { "x": 1.8, "y": 8.7, "amount": 1.3 }, { "x": 0.2, "y": 2.8, "amount": 1.1 }, { "x": 7.4, "y": 1.0, "amount": 1.7 }, { "x": 6.4, "y": 5.6, "amount": 1.7 }] }];
var result = [];    // 路径规划结果
var xTimes = 1;
var yTimes = 1;

// window.onload = function() {
//     drawAllPoints(centerData, pointData);
// }

// 绘制结点
function drawAllPoints(centerData, pointData) {
    var ctx = $("#canvasContainer").get(0).getContext("2d");
    var maxCenterX = maxXValue(centerData);
    var maxCenterY = maxYValue(centerData);
    var maxPointX = maxXValue(pointData);
    var maxPointY = maxYValue(pointData);
    var maxX = (maxCenterX > maxPointX ? maxCenterX : maxPointX);
    var maxY = (maxCenterY > maxPointY ? maxCenterY : maxPointY);
    xTimes = parseInt(1200 / maxX);
    yTimes = parseInt(600 / maxY);
    for (index in centerData) {
        ctx.beginPath();
        ctx.arc(centerData[index].x * xTimes, centerData[index].y * yTimes, 5, 0, Math.PI * 2, true);
        ctx.fillStyle = "red";
        ctx.font = "12px Arial";
        ctx.fillText("配送中心(" + centerData[index].x + ", " + centerData[index].y + ")", centerData[index].x * xTimes - 10, centerData[index].y * yTimes - 5);
        ctx.closePath();
        ctx.fill();
    }
    for (index in pointData) {
        ctx.beginPath();
        ctx.arc(pointData[index].x * xTimes, pointData[index].y * yTimes, 5, 0, Math.PI * 2, true);
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText("(" + pointData[index].x + ", " + pointData[index].y + ")", pointData[index].x * xTimes - 10, pointData[index].y * yTimes - 5)
        ctx.stroke();
    }
}

// 获取横坐标最大值
function maxXValue(array) {
    var list = new Array();
    for (var index in array) {
        list.push(array[index].x);
    }
    list.sort(function(num1, num2) {
        return num1 - num2;
    })
    return list[list.length - 1];
}

// 获取纵坐标最大值
function maxYValue(array) {
    var list = new Array();
    for (var index in array) {
        list.push(array[index].y);
    }
    list.sort(function(num1, num2) {
        return num1 - num2;
    })
    return list[list.length - 1];
}

// 绘制路径图
function start() {
    step = 1.7976931348623157E+10308;
    var ctx = $("#canvasContainer").get(0).getContext("2d");
    for (var carIndex = 0; carIndex < result.length; carIndex++) {
        var carId = result[carIndex].id;
        var color = result[carIndex].color;
        var route = result[carIndex].route;
        for (var index = 0; index < (route.length - 1); index++) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            var x_start = route[index].x * xTimes;
            var y_start = route[index].y * yTimes;
            var x_end = route[index + 1].x * xTimes;
            var y_end = route[index + 1].y * yTimes;
            ctx.moveTo(x_start, y_start);
            ctx.lineTo(x_end, y_end);
            ctx.font = "12px Arial";
            ctx.fillText("路线" + (carIndex + 1).toString(), (x_start + x_end) / 2, (y_start + y_end) / 2);
            ctx.stroke();
        }
    }
}

// 逐步绘制
function bystep() {
    var ctx = $("#canvasContainer").get(0).getContext("2d");
    var routeNum = result.length;
    var maxStep = 0;
    for (var routeIndex = 0; routeIndex < routeNum; routeIndex++) {
        var color = result[routeIndex].color;
        if (result[routeIndex].route.length > maxStep) {
            maxStep = result[routeIndex].route.length;
        }
        if (step < result[routeIndex].route.length - 1) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            var x_start = result[routeIndex].route[step].x * xTimes;
            var y_start = result[routeIndex].route[step].y * yTimes;
            var x_end = result[routeIndex].route[step + 1].x * xTimes;
            var y_end = result[routeIndex].route[step + 1].y * yTimes;
            ctx.moveTo(x_start, y_start);
            ctx.lineTo(x_end, y_end);
            ctx.font = "12px Arial";
            ctx.fillText("路线" + (routeIndex + 1).toString(), (x_start + x_end) / 2, (y_start + y_end) / 2);
            ctx.stroke();
        }
    }
    if (step >= maxStep) {
        alert("绘制完毕");
    }
    step++;
}

// 重置Canvas
function tryAgain() {
    step = 0;
    var canvas = $("#canvasContainer").get(0);
    var ctx = canvas.getContext("2d");
    canvas.height = canvas.height;
    var center = $("#tbodyCenter").get(0);
    var point = $("#tbodyPoint").get(0);
    var car = $("#tbodyCar").get(0);
    var rows_center = center.rows;
    var rows_point = point.rows;
    var rows_car = car.rows;
    var centerData = [];
    var pointData = [];
    var carData = [];
    // 遍历中心表
    for (var index = 0; index < rows_center.length; index++) {
        var x = rows_center[index].cells[0].innerText;
        var y = rows_center[index].cells[1].innerText;
        var centerItem = {
            "x": parseFloat(x),
            "y": parseFloat(y)
        };
        centerData.push(centerItem);
    }
    // 遍历配送点
    for (var index = 0; index < rows_point.length; index++) {
        var x = rows_point[index].cells[0].innerText;
        var y = rows_point[index].cells[1].innerText;
        var amount = rows_point[index].cells[2].innerText;
        var pointItem = {
            "x": parseFloat(x),
            "y": parseFloat(y),
            "amount": parseFloat(amount)
        };
        pointData.push(pointItem);
    }
    // 遍历载具信息
    for (var index = 0; index < rows_car.length; index++) {
        var distance = rows_car[index].cells[0].innerText;
        var amount = rows_car[index].cells[1].innerText;
        var carItem = {
            "distance": parseFloat(distance),
            "amount": parseFloat(amount)
        };
        carData.push(carItem);
    }
    drawAllPoints(centerData, pointData);
}

// 重置页面
function reset() {
    var canvas = $("#canvasContainer").get(0);
    var tbodyCenter = $("#tbodyCenter").get(0);
    var tbodyPoint = $("#tbodyPoint").get(0);
    var tbodyCar = $("#tbodyCar").get(0);
    var routeContainer = $("#routeText").get(0);
    var ctx = canvas.getContext("2d");
    canvas.height = canvas.height;
    step = 0;
    tbodyCenter.innerHTML = "";
    tbodyPoint.innerHTML = "";
    tbodyCar.innerHTML = "";
    routeContainer.innerHTML = "";
    xTimes = 1;
    yTimes = 1;
}

// 显示添加配送中心页面
function showAddCenterPage() {
    $("#centerPage").show();
}

// 隐藏添加配送中心页面
function hiddenAddCenterPage() {
    $("#centerPage").hide();
}

// 添加配送中心
function addCenter() {
    var center_x = $("#center_x").val();
    var center_y = $("#center_y").val();
    if (center_x == '' || center_y == '') {
        alert("数据填写不完整！");
        return;
    }
    var tbody = $("#tbodyCenter").get(0);
    tbody.appendChild(tr_center(center_x, center_y));
    $(".del-center").click(function() {
        var tr = this.parentNode.parentNode;
        tr.remove();
    });
    $("#center_x").val('');
    $("#center_y").val('');
    hiddenAddCenterPage();
}

// 创建配送中心条目
function tr_center(x, y) {
    var tr = document.createElement("tr");
    var td_x = document.createElement("td");
    td_x.innerText = x;
    var td_y = document.createElement("td");
    td_y.innerText = y;
    var td_option = document.createElement("td");
    var btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-danger del-center");
    btn.innerText = "移除";
    td_option.appendChild(btn);
    tr.appendChild(td_x);
    tr.appendChild(td_y);
    tr.appendChild(td_option);
    return tr;
}

// 添加配送点
function addPoint() {
    var point_x = $("#point_x").val();
    var point_y = $("#point_y").val();
    var point_amount = $("#point_amount").val();
    if (point_x == '' || point_y == '' || point_amount == '') {
        alert("数据填写不完整！");
        return;
    }
    var tbody = $("#tbodyPoint").get(0);
    tbody.appendChild(tr_point(point_x, point_y, point_amount));
    $(".del-point").click(function() {
        var tr = this.parentNode.parentNode;
        tr.remove();
    });
    $("#point_x").val('');
    $("#point_y").val('');
    $("#point_amount").val('');
    hiddenAddPointPage();
}

// 创建配送点条目
function tr_point(x, y, amount) {
    var tr = document.createElement("tr");
    var td_x = document.createElement("td");
    td_x.innerText = x;
    var td_y = document.createElement("td");
    td_y.innerText = y;
    var td_amount = document.createElement("td");
    td_amount.innerText = amount;
    var td_option = document.createElement("td");
    var btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-danger del-point");
    btn.innerText = "移除";
    td_option.appendChild(btn);
    tr.appendChild(td_x);
    tr.appendChild(td_y);
    tr.appendChild(td_amount);
    tr.appendChild(td_option);
    return tr;
}

// 隐藏添加配送点页面
function hiddenAddPointPage() {
    $("#pointPage").hide();
}

// 显示添加配送点页面
function showAddPointPage() {
    $("#pointPage").show();
}

// 添加载具
function addCar() {
    var car_distance = $("#car_distance").val();
    var car_amount = $("#car_amount").val();
    if (car_distance == '' || car_amount == '') {
        alert("数据填写不完整！");
        return;
    }
    var tbody = $("#tbodyCar").get(0);
    tbody.appendChild(tr_car(car_distance, car_amount));
    $(".del-car").click(function() {
        var tr = this.parentNode.parentNode;
        tr.remove();
    });
    $("#car_distance").val('');
    $("#car_amount").val('');
    hiddenAddCarPage();
}

// 创建载具条目
function tr_car(distance, amount) {
    var tr = document.createElement("tr");
    var td_distance = document.createElement("td");
    td_distance.innerText = distance;
    var td_amount = document.createElement("td");
    td_amount.innerText = amount;
    var td_option = document.createElement("td");
    var btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-danger del-car");
    btn.innerText = "移除";
    td_option.appendChild(btn);
    tr.appendChild(td_distance);
    tr.appendChild(td_amount);
    tr.appendChild(td_option);
    return tr;
}

// 隐藏添加配送点页面
function hiddenAddCarPage() {
    $("#carPage").hide();
}

// 显示添加配送点页面
function showAddCarPage() {
    $("#carPage").show();
}

// 提交
function submit() {
    // onload();
    // // 文字路径信息
    // var routeText = $("#routeText").get(0);
    // for (index in result) {
    //     var p = document.createElement("p");
    //     p.setAttribute("style", "width: 100%;");
    //     var route = "";
    //     for (routeIndex in result[index].route) {
    //         var x = result[index].route[routeIndex].x;
    //         var y = result[index].route[routeIndex].y;
    //         route = route + "(" + x + ", " + y + ") → "
    //     }
    //     p.innerText = "路径" + (parseInt(index) + 1) + ": " + route + "(" + result[index].route[0].x + ", " + result[index].route[0].y + ")";
    //     routeText.appendChild(p);
    // }
    // return;
    var center = $("#tbodyCenter").get(0);
    var point = $("#tbodyPoint").get(0);
    var car = $("#tbodyCar").get(0);
    var rows_center = center.rows;
    var rows_point = point.rows;
    var rows_car = car.rows;
    var centerData = [];
    var pointData = [];
    var carData = [];
    // 遍历中心表
    for (var index = 0; index < rows_center.length; index++) {
        var x = rows_center[index].cells[0].innerText;
        var y = rows_center[index].cells[1].innerText;
        var centerItem = {
            "x": parseFloat(x),
            "y": parseFloat(y)
        };
        centerData.push(centerItem);
    }
    // 遍历配送点
    for (var index = 0; index < rows_point.length; index++) {
        var x = rows_point[index].cells[0].innerText;
        var y = rows_point[index].cells[1].innerText;
        var amount = rows_point[index].cells[2].innerText;
        var pointItem = {
            "x": parseFloat(x),
            "y": parseFloat(y),
            "amount": parseFloat(amount)
        };
        pointData.push(pointItem);
    }
    // 遍历载具信息
    for (var index = 0; index < rows_car.length; index++) {
        var distance = rows_car[index].cells[0].innerText;
        var amount = rows_car[index].cells[1].innerText;
        var carItem = {
            "distance": parseFloat(distance),
            "amount": parseFloat(amount)
        };
        carData.push(carItem);
    }
    $.ajax({
        url: '/',
        type: 'post',
        data: {
            'centerData': JSON.stringify(centerData),
            'pointData': JSON.stringify(pointData),
            'carData': JSON.stringify(carData)
        },
        success: function(res) {
            drawAllPoints(centerData, pointData);
            for (index in res) {
                res[index].color = color16();
            }
            result = res.result;
            var totalDistance = res.totalDistance;
            // 文字路径信息
            var routeText = $("#routeText").get(0);
            for (var index = 0; index < result.length; index++) {
                var currentRoute = result[index].route;
                var point = ""; //路径
                for (routeIndex in currentRoute) {
                    var x = currentRoute[routeIndex].x;
                    var y = currentRoute[routeIndex].y;
                    point = point + "(" + x + ", " + y + ") → "
                }
                var p = document.createElement("p");
                p.setAttribute("style", "width: 100%;");
                p.innerText = "车辆类型：" + result[index].carid +  "型 路径" + (parseInt(index) + 1) + ": " + point + "(" + currentRoute[0].x + ", " + currentRoute[0].y + ")";
                routeText.appendChild(p);
            }
            var p = document.createElement("p");
            p.setAttribute("style", "width: 100%;");
            p.innerText =  "共计行驶：" + totalDistance + "公里";
            routeText.appendChild(p);
            alert("规划完成！");
        },
        error: function() {
            alert("后端服务未开启，请启动或重启相关文件以开启后端服务！");
        }
    })
}

// 随机赋予颜色
function color16() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
    return color;
}

// 通过文件读取配送数据信息
function getPointsByFile(obj) {
    var file = obj.files[0];
    var tbody = $("#tbodyPoint").get(0);
    tbody.innerHTML = "";
    readWorkbookFromLocalFile(file, function(data) {
        for (var index in data) {
            var point = data[index];
            if (point.x == undefined || point.y == undefined || point.amount == undefined) {
                alert("文件数据格式异常：请严格遵守文件格式，Excel表格表头为x, y, amount！");
                window.location.reload();
                return;
            }
            var x = parseFloat(point.x);
            console.log(x);
            var y = parseFloat(point.y);
            var account = parseFloat(point.amount);
            tbody.appendChild(tr_point(x, y, account));
        }
        $(".del-point").click(function() {
            var tr = this.parentNode.parentNode;
            tr.remove();
        });
    });
}

// 通过文件读取配送中心数据信息
function getCentersByFile(obj) {
    var file = obj.files[0];
    var tbody = $("#tbodyCenter").get(0);
    tbody.innerHTML = "";
    readWorkbookFromLocalFile(file, function(data) {
        for (var index in data) {
            var center = data[index];
            if (center.x == undefined || center.y == undefined) {
                alert("文件数据格式异常：请严格遵守文件格式，Excel表格表头为x, y！");
                window.location.reload();
                return;
            }
            var x = parseFloat(center.x);
            var y = parseFloat(center.y);
            tbody.appendChild(tr_center(x, y));
        }
        $(".del-center").click(function() {
            var tr = this.parentNode.parentNode;
            tr.remove();
        });
    });
}

// 通过文件读取车辆数据信息
function getCarsByFile(obj) {
    var file = obj.files[0];
    var tbody = $("#tbodyCar").get(0);
    tbody.innerHTML = "";
    readWorkbookFromLocalFile(file, function(data) {
        for (var index in data) {
            var car = data[index];
            if (car.distance == undefined || car.amount == undefined) {
                alert("文件数据格式异常：请严格遵守文件格式，Excel表格表头为distance, amount！");
                window.location.reload();
                return;
            }
            var distance = parseFloat(car.distance);
            var amount = parseFloat(car.amount);
            tbody.appendChild(tr_car(distance, amount));
        }
        $(".del-car").click(function() {
            var tr = this.parentNode.parentNode;
            tr.remove();
        });
    });
}

// 读取本地excel文件
function readWorkbookFromLocalFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: 'binary' });
        var sheet = workbook.Sheets["Sheet1"];
        var json = XLSX.utils.sheet_to_json(sheet);
        if (callback) callback(json);
    };
    reader.readAsBinaryString(file);
}
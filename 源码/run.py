from flask import Flask, request, jsonify, make_response, render_template
import os
import math
import sys
import random
import time

class Point:
    def __init__(self,id,x,y):
        self.id=id
        self.x=x
        self.y=y

class Customer(Point):
    def __init__(self,id,x,y,need):
        Point.__init__(self,id,x,y)
        self.name="Customer_"+str(id)
        self.need=need

class Center(Point):
    def __init__(self,id,x,y):
        Point.__init__(self,id,x,y)
        self.name='Center_{}'.format(id)

class Car:
    def __init__(self,id,distance_limit,load_capacity):
        self.id=id
        self.distance_limit=distance_limit
        self.load_capacity=load_capacity
        self.name='Car_'+str(id)


class Data:
    #def __init__(self,filename):
    def __init__(self):
        self.ALPHA=1.0
        self.BETA=2.0
        self.RHO=0.5
        self.Q =100.0
        #物流中心和物流中心数
        self.centers=[]
        self.center_num=0
        #客户点和客户点数
        self.customer_points=[]
        self.customer_points_num=0
        #配送车和车的种类数
        self.cars=[]
        self.car_num=0
        #物流中心和客户点总数
        self.place_num=0
        #物流中心坐标
        self.distance_center=[]
        #客户点坐标
        self.distance_customer=[]
        #所有点的坐标
        self.distance=[]
        #客户点需求量
        self.need_city=[]
        #下标和物流中心和客户点名称的对应关系
        self.place=dict()
        #各地点之间的距离，包括物流中心和客户点
        self.distance_graph=[]
        
        #self.get_data(filename)
    
    def get_data(self,filename):
        try:
            f=open(filename)
            while True:
                s=f.readline()
                if s=='':
                    break
                s=s.strip('\n')
                if s=='Center:':
                    self.center_num+=1
                    center=dict()
                    for i in range(2):
                        data=f.readline().strip('\n').split('=')
                        center[data[0]]=float(data[1])
                    self.centers.append(Center(self.center_num,center['x'],center['y']))
                if s=='Customer_Points:':
                    data=f.readline().strip('\n')
                    while data!='':
                        self.customer_points_num+=1
                        x,y,need=map(float,data.split())
                        self.customer_points.append(Customer(self.customer_points_num,x,y,need))
                        data=f.readline().strip('\n')
                
                if s=='Car:':
                    self.car_num+=1
                    car=dict()
                    for i in range(2):
                        data=f.readline().strip('\n').split('=')
                        car[data[0]]=float(data[1])
                    self.cars.append(Car(self.car_num,car['distance_limit'],car['load_capacity']))

            f.close()
        except:
            print('文件不存在或读取失败！')
        
        #获取地点坐标和需求
        i=0
        for c in self.centers:
            self.distance_center.append([c.x,c.y])
            self.need_city.append(0)
            self.place[i]=c.name
            i+=1
        for c in self.customer_points:
            self.distance_customer.append([c.x,c.y])
            self.need_city.append(c.need)
            self.place[i]=c.name
            i+=1
        self.distance=self.distance_center+self.distance_customer

        self.place_num=self.center_num+self.customer_points_num


        #获取各点之间的距离
        self.distance_graph=[[0.0 for i in range(self.place_num)] for j in range(self.place_num)]
        for i in range(self.place_num):
            for j in range(self.place_num):
                temp_distance = (self.distance[i][0]-self.distance[j][0]
                         )**2+(self.distance[i][1]-self.distance[j][1])**2
                temp_distance = temp_distance**0.5
                self.distance_graph[i][j] = float(int(temp_distance + 0.5))


class Ant:
    def __init__(self, ID,data,open_table_city,pheromone_graph):
        self.ID = ID
        self.open_table_city=open_table_city
        #self.pheromone_graph = [[0.0 for col in range(place_num)] for raw in range(place_num)]
        self.pheromone_graph=pheromone_graph
        self.path = []
        self.current_load = 0
        self.load_rate = 0
        self.total_distance = 0.0
        self.distance_graph=data.distance_graph
        self.need_city=data.need_city
        self.ALPHA=data.ALPHA
        self.BETA=data.BETA
        self.center_num=data.center_num

        #随机确定蚂蚁的出发点（物流中心）和蚂蚁所对应的车型
        center_id=random.randint(1,1000)%data.center_num
        car_id=random.randint(1,1000)%data.car_num
        load_capacity=data.cars[car_id].load_capacity
        distance_limit=data.cars[car_id].distance_limit
        self.car_id=car_id
        self.load_capacity = load_capacity
        self.distance_limit = distance_limit

        self.center=center_id
        # 首先设定配送中心的代号为0
        self.current_place = center_id
        self.path.append(center_id)

    def choice_next_city(self):
        next_city = self.center
        total_prob = 0.0
        place_num=len(self.open_table_city)

        select_citys_probably = [0.0 for i in range(place_num)]

        # 获取去下一个城市的概率
        for i in range(place_num):
            if not self.open_table_city[i] and self.total_distance+self.distance_graph[self.current_place][i]+self.distance_graph[i][self.center] <= self.distance_limit and self.current_load+self.need_city[i] <= self.load_capacity:
                try:
                    select_citys_probably[i] = pow(self.pheromone_graph[self.current_place][i], self.ALPHA)*pow(
                        (1.0/self.distance_graph[self.current_place][i]), self.BETA)
                    total_prob += select_citys_probably[i]
                except ZeroDivisionError as e:
                    print("Ant ID: {ID}, current city: {current}, target city: {target}".format(
                        ID=self.ID, current=self.current_place, target=i))
                    sys.exit(1)
        # print(select_citys_probably)
        # 轮盘选择城市
        if total_prob > 0.0:
            # 产生一个随机概率,0.0-total_prob
            temp_prob = random.uniform(0.0, total_prob)
            for i in range(self.center_num, place_num):
                if not self.open_table_city[i]:
                    # 轮次相减
                    temp_prob -= select_citys_probably[i]
                    if temp_prob < 0.0:
                        next_city = i
                        break
        return next_city
    def search(self):
        while True:
            next_city=self.choice_next_city()
            self.path.append(next_city)
            self.open_table_city[next_city] = True
            self.current_load+=self.need_city[next_city]
            self.total_distance += self.distance_graph[self.current_place][next_city]
            self.current_place = next_city
            if self.current_place == self.center:
                break


class Data(object):
    """docstring for Data"""
    def __init__(self):
        self.ALPHA=1.0
        self.BETA=2.0
        self.RHO=0.5
        self.Q =100.0
        #物流中心和物流中心数
        self.centers=[]
        self.center_num=0
        #客户点和客户点数
        self.customer_points=[]
        self.customer_points_num=0
        #配送车和车的种类数
        self.cars=[]
        self.car_num=0
        #物流中心和客户点总数
        self.place_num=0
        #物流中心坐标
        self.distance_center=[]
        #客户点坐标
        self.distance_customer=[]
        #所有点的坐标
        self.distance=[]
        #客户点需求量
        self.need_city=[]
        #下标和物流中心和客户点名称的对应关系
        self.place=dict()
        #各地点之间的距离，包括物流中心和客户点
        self.distance_graph=[]


    def setData(self, center, point, car):
        for index in range(len(center)):
            self.center_num += 1
            x = center[index].get('x')
            y = center[index].get('y')
            self.centers.append(Center(self.center_num, x, y))
        for index in range(len(point)):
            self.customer_points_num += 1
            x = float(point[index].get('x'))
            y = float(point[index].get('y'))
            amount = float(point[index].get('amount'))
            self.customer_points.append(Customer(self.customer_points_num, x, y, amount))
        for index in range(len(car)):
            self.car_num += 1
            distance = car[index].get('distance')
            amount = car[index].get('amount')
            self.cars.append(Car(self.car_num, distance, amount))
        #获取地点坐标和需求
        i=0
        for c in self.centers:
            self.distance_center.append([c.x,c.y])
            self.need_city.append(0)
            self.place[i]=c.name
            i+=1
        for c in self.customer_points:
            self.distance_customer.append([c.x,c.y])
            self.need_city.append(c.need)
            self.place[i]=c.name
            i+=1
        self.distance=self.distance_center+self.distance_customer

        self.place_num=self.center_num+self.customer_points_num


        #获取各点之间的距离
        self.distance_graph=[[0.0 for i in range(self.place_num)] for j in range(self.place_num)]
        for i in range(self.place_num):
            for j in range(self.place_num):
                temp_distance = (float(self.distance[i][0]) - float(self.distance[j][0])
                         )**2+(float(self.distance[i][1]) - float(self.distance[j][1])) ** 2
                temp_distance = temp_distance**0.5
                self.distance_graph[i][j] = float(int(temp_distance + 0.5))


class VRP:
    def __init__(self,data):
        self.best_path=[]
        self.best_car=[]
        self.best_load_rate=0
        self.best_total_distance=0
        self.best_indicator=-1
        self.iteration=0
        self.pheromone_graph=[[1.0 for col in range(data.place_num)] for raw in range(data.place_num)]
        #获取需要的数据
        self.data=data
        self.center_num=data.center_num
        self.customer_points_num=data.customer_points_num
        self.place_num=data.place_num
        self.Q=data.Q
        self.cars=data.cars
        self.RHO=data.RHO
        self.car_num=data.car_num

    
    def __move(self):
    #def move(self):
        # 城市是否被访问
        open_table_city=[True for i in range(self.center_num)]+[False for i in range(self.customer_points_num)]
        temp_pheromone_graph = [[0.0 for col in range(self.place_num)] for raw in range(self.place_num)]
        temp_car=[]
        temp_path=[]
        temp_load_rate=0.0
        temp_total_diatance=0.0
        i=0
        h=self.customer_points_num
        while h>0:
            ant=Ant(i,self.data,open_table_city,self.pheromone_graph)
            ant.search()
            open_table_city=ant.open_table_city
            h=open_table_city.count(False)
            #当前蚂蚁经过的路径和距离
            path=ant.path
            total_distance=ant.total_distance
            car_id=ant.car_id
            #temp_car.append(self.cars[car_id].name)
            temp_car.append(car_id)
            for j in range(1,len(path)):
                try:
                    temp_pheromone_graph[path[j-1]][path[j]]=self.Q/total_distance
                except ZeroDivisionError:
                    print(f"当前车辆{temp_car[-1]}无法满足部分城市运送距离，请检查原始数据集")
                    #sys.exit(1)
                    continue
                temp_pheromone_graph[path[j]][path[j-1]]=temp_pheromone_graph[path[j-1]][path[j]]
            temp_path.append(path)
            temp_load_rate+=ant.current_load/ant.load_capacity
            temp_total_diatance+=total_distance

            i+=1
        temp_load_rate=temp_load_rate/i
        return temp_path,temp_pheromone_graph,temp_load_rate,temp_total_diatance,temp_car

    def loop(self):
        iteration=0
        while True:
            temp_path,temp_pheromone_graph,temp_load_rate,temp_total_diatance,temp_car=self.__move()
            temp_indicator=temp_load_rate+self.Q/temp_total_diatance
            if self.best_indicator<temp_indicator:
                iteration=0
                self.best_path=temp_path
                self.best_indicator=temp_indicator
                self.best_load_rate=temp_load_rate
                self.best_total_distance=temp_total_diatance
                self.best_car=temp_car
                for m in range(self.place_num):
                    for n in range(self.place_num):
                        self.pheromone_graph[m][n]=self.pheromone_graph[m][n]*self.RHO+temp_pheromone_graph[m][n]
            else:
                iteration+=1

            if self.iteration<=8000:
                #print(f"This is {self.iteration} iteration: best path is: {self.best_path}, best_distance is: {self.best_total_distance}, best_load_rate is: {self.best_load_rate}, and the indicator is: {self.best_indicator}")
                pass
            else:
                break
            self.iteration+=1


app = Flask(__name__)


@app.route('/home.html', methods=['POST', 'GET'])
def home():
    return render_template('home.html')


@app.route('/', methods=['POST'])
def getRoute():
	center = eval(request.form.get('centerData'))
	point = eval(request.form.get('pointData'))
	car = eval(request.form.get('carData'))
	data = Data()
	data.setData(center, point, car)
	vrp=VRP(data)
	vrp.loop()
	car=vrp.best_car
	path=vrp.best_path
	result = []	# 存放行驶路线
	for i in range(len(car)):
		id=int(car[i])
		c=data.cars[id]
		name=c.name
		distance_limit=c.distance_limit
		load_capacity=c.load_capacity
		route = []  # 存放路线地点
		p=path[i]
		for j in range(len(p)-1):
			# print(data.place[p[j]],end='->')
			place = data.place[p[j]]
			placeId = int(place.split('_')[1]) - 1
			if j == 0:  # 起点
				spot = center[placeId]
				route.append(spot)
			else:   # 配送点
				spot = point[placeId]
				route.append(spot)
		result.append({'carid': id, 'route': route})
		print(data.place[p[j]])
	best_total_distance = vrp.best_total_distance	# 总行驶距离

	res = make_response(jsonify({'result': result, 'totalDistance': best_total_distance}))
	res.headers['Access-Control-Allow-Origin'] = '*'
	return res


if __name__ == '__main__':
	app.run(debug=True)
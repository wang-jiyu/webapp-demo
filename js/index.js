	 'use strict';

	angular.module('app',['ui.router','ngCookies','validation','ngAnimate']);  //创建模块
	/*.run(['$rootScope',function ($rootScope) { //初始化模块

	}]); */
	'use strict';
	angular.module('app')
	.value('dict',{}) //创建全局变量，没有动态对象，只有值
	.run(['dict','$http',function (dict,$http) {		//模块初始化操作，引入dict全局变量
		$http.get('data/city.json').then(function(resp){
			dict.city=resp.data;
		}, function(resp){
			console.log(resp.data);
		});
		$http.get('data/salary.json').then(function(resp){
			dict.salary=resp.data;
		}, function(resp){
			console.log(resp.data);
		});
		$http.get('data/scale.json').then(function(resp){
			dict.scale=resp.data;
		}, function(resp){
			console.log(resp.data);
		});
	}]);  
	'use strict';
	angular.module('app')
	.config(['$provide',function ($provide) {  //修改$http服务POST改为get 
		$provide.decorator('$http',['$delegate','$q',function($delegate,$q){ //这里面的$delegate指代$http服务
			$delegate.post=function(url,data,config){ //$delegate代表$http,让控制器里面$http.post改$http.get请求
				var def = $q.defer();
				$delegate.get(url).then(function(resp){
					def.resolve(resp.data);
				}, function(resp){
					/*失败回调*/
					def.reject(resp);
				});

				return{
					success:function(cb){
						def.promise.then(cb);
					},
					error:function(cb){
						def.promise.then(null,cb);
					}
				}
			}
			return $delegate;
		}]);
	}])
	'use strict';
	angular.module('app')   //引入模块
	.config(['$stateProvider','$urlRouterProvider',function ($stateProvider,$urlRouterProvider) { //配置显示声明
		$stateProvider.state('main',{ //第一个参数配置路由
			url:'/main',  //url后面的哈希值
			templateUrl:'view/main.html', //页面模板
			controller:'mainCtrl'  //页面逻辑
		}).state('position',{
			url:'/position/:id',
			templateUrl:'view/position.html',
			controller:'positionCtrl'
		}).state('company',{
			url:'/company/:id',
			templateUrl:'view/company.html',
			controller:'companyCtrl'
		}).state('search',{
			url:'/search',
			templateUrl:'view/search.html',
			controller:'searchCtrl'
		}).state('login',{
			url:'/login',
			templateUrl:'view/login.html',
			controller:'loginCtrl'
		}).state('register',{
			url:'/register',
			templateUrl:'view/register.html',
			controller:'registerCtrl'
		}).state('me',{
			url:'/me',
			templateUrl:'view/me.html',
			controller:'meCtrl'
		}).state('favorite',{
			url:'/favorite',
			templateUrl:'view/favorite.html',
			controller:'favoriteCtrl'
		}).state('post',{
			url:'/post',
			templateUrl:'view/post.html',
			controller:'postCtrl'
		});
		$urlRouterProvider.otherwise('main'); //默认跳转
	}])
	'use strict';
	angular.module('app')
	.config(['$validationProvider',function($validationProvider){
		var expression = {  //此表达式为了保证表单值是否符合要求
			phone:/^1[\d]{10}$/,    //每条属性代表一种校验规则
			password: function(value){
				var str = value + '' //转成字符串
     			return str.length > 5;
			},
			required:function(value){
				return !!value;  //不可为空
			}
		};
		var defaultMsg = { //错误提示配置
			phone:{
				success:'',
				error:'必须输入11位手机号'
			},
			password:{
				success:'',
				error:'必须输入大于6位密码'
			},
			required:{
				success:'',
				error:'不能为空'
			}
		}
		$validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);//进行配置
	}]);
angular.module('app')
.controller('companyCtrl',['$http','$state','$scope',function($http,$state,$scope){
	$http.get('data/company.json?id='+$state.params.id)
	.then(function(resp){
		$scope.company=resp.data;
	},function(resp){
		console.log(resp.data);
	});

}]);
	'use strict';
	angular.module('app')
	.controller('favoriteCtrl', ['$http','$scope', function($http,$scope){
		$http.get('data/myFavorite.json')
		.success(function(resp){
			$scope.list = resp;
		});
	}]);
	'use strict';
	angular.module('app')
	.controller('loginCtrl', ['cache','$http','$scope','$state', function(cache,$http,$scope,$state){
		$scope.submit = function(){
			$http.post('data/login.json',$scope.user)
			.success(function(resp){
				cache.put('id',resp.id);
				cache.put('name',resp.name);
				cache.put('image',resp.image);
				$state.go('main');
			});
		}
	}]);
	'use strict';
	angular.module('app')
	.controller('mainCtrl',['$http','$scope',function($http,$scope){
		$http.get('/webapp-demo/data/positionList.json')
		.then(function(resp){	//成功回调
			// console.log(resp);
			$scope.list=resp.data;
		},function(resp){  //失败回调
			console.log(resp);
		});
		/*$scope.list = [{
			id:'1',
			name:'销售',
			imgSrc:'image/company-3.png',
			companyName:'千度',
			city:'上海',
			industry:'互联网',
			time:'2016-06-01 11:05'
		},{
			id:'2',
			name:'WEB前端',
			imgSrc:'image/company-1.png',
			companyName:'慕课网',
			city:'北京',
			industry:'互联网',
			time:'2016-06-01 11:05'
		}];*/
	}]);
	'use strict';
	angular.module('app')
	.controller('meCtrl', ['cache','$scope','$state', function(cache,$scope,$state){
		if(cache.get('name')){ //通过name来判断用户是否登录
			$scope.name=cache.get('name');
			$scope.image=cache.get('image');
			$scope.id=cache.get('id');
		}
		$scope.logout = function(){
			cache.remove('id');
			cache.remove('name');
			cache.remove('image');
			$state.go('main');
		}
	}]);
	'use strict'
	angular.module('app')
	.controller('positionCtrl',['$log','$q','$http','$state','$scope','cache',function($log,$q,$http,$state,$scope,cache){
		$scope.isLogin = !!cache.get('name'); //两个！！可以转换成布尔值 
		$scope.message = $scope.isLogin?'投个简历':'去登录';
		function getPosition(){
			var def=$q.defer(); //声明延迟加载对象
			$http.get('/webapp-demo/data/position.json?id='+$state.params.id)
			.then(function(resp){ //成功回调
				// console.log(resp.data)
				$scope.position = resp.data;
				if(resp.data.posted){
					$scope.message = '已投递';
				}

				def.resolve(resp.data); //成功之后返回数据 
			},function(resp){  //失败回调
				def.reject(resp.data);
			});
			return def.promise;
		}

		function getCompany(id){
			$http.get('webapp-demo/data/company.json?id='+id).then(function(resp){
				// console.log(resp);
				$scope.company = resp.data;
			})
		}

		getPosition().then(function(resp){
			getCompany(resp.companyId);
		});

		$scope.go = function(){
			if($scope.message !== '已投递'){
				if($scope.isLogin){
					$http.post('data/handle.json',{
						id:$scope.position.id
					}).success(function(resp){
						$log.info(resp); //打印日志服务 
						$scope.message = '已投递';
					});
				}else{
					$state.go('login');
				}
			}
		}
		
	}]);
	'use strict';
	angular.module('app')
	.controller('postCtrl', ['$http','$scope', function($http,$scope){
		$scope.tabList = [{
			id:'all',
			name:'全部'
		},{
			id:'pass',
			name:'面试邀请'
		},{
			id:'fail',
			name:'不合适'
		}];
		$http.get('data/myPost.json')
		.success(function(resp){
			$scope.positionList=resp;
		});
		$scope.filterObj = {}; //用来过滤数据 
		$scope.tClick = function(id,name){
			switch (id) {
				case 'all':
					delete $scope.filterObj.state;
					break;
				case 'pass':
					$scope.filterObj.state = '1';
					break;
				case 'fail':
					$scope.filterObj.state = '-1';
					break;
					default:
			}
		}
	}]);
	'use strict';
	angular.module('app')
	.controller('registerCtrl', ['$interval','$http','$scope','$state', function($interval,$http,$scope,$state){
		$scope.submit = function(){
			$http.post('data/regist.json',$scope.user)
			.success(function(resp){
				$state.go('login');
			});
		}
		var count = 60;
		$scope.send = function(){
			$http.get('data/code.json')
			.then(function(resp){
				if(1===resp.data.state){
					count=60;
					$scope.time='60s';
					var interval = $interval(function(){
						if(count<=0){
							$interval.cancel(interval);
							$scope.time='';
						}else{
							count--;
							$scope.time = count + 's';
						}
						
					},1000);
				}
			},function(resp){
				console.log(resp.data);
			});
		}
	}]);
	'use strict';
	angular.module('app')
	.controller('searchCtrl', ['dict','$http','$scope', function(dict,$http,$scope){
		$scope.name = '';
		$scope.search = function(){
			$http.get('data/positionList.json?name=' + $scope.name)
			.then(function(resp){
				$scope.positionList=resp.data;
			},function(resp){
				console.log(resp.data);
			});
		}
		$scope.search();
		$scope.sheet={};
		$scope.tabList=[{
			id:'city',
			name:'城市'
		},{
			id:'salary',
			name:'薪水'
		},{
			id:'scale',
			name:'公司规模'
		}];
		$scope.filterObj={};
		var tabId = '';
		$scope.tClick = function(id,name){
			tabId = id;
			// console.log(dict);
			$scope.sheet.list = dict[id];
			$scope.sheet.visible=true;
		}
		$scope.sClick = function(id,name){
			if(id) {
				angular.forEach($scope.tabList,function(item){
					if(item.id===tabId){
						item.name=name;
					}
				});
				$scope.filterObj[tabId + 'Id'] = id;
			} else {
				delete $scope.filterObj[tabId + 'Id'];
				angular.forEach($scope.tabList,function(item){
					if(item.id===tabId){
						switch(item.id){
							case 'city' :
							item.name = '城市';
							break;
							case 'salary' :
							item.name = '薪水';
							break;
							case 'scale' :
							item.name = '公司规模';
							break;
							default:
						}
					}
				});
			}
		}
	}]);
	'use strict';
	angular.module('app').directive('appCompany',[function () {
		return {
			restrict:'A',
			replace:true,
			scope:{
				com:'='
			},
			templateUrl:'view/template/company.html'
		};
	}]);
	'use strict';
	angular.module('app').directive('appFoot',[function(){
		return{
			restrict:'A',
			replace:true,
			templateUrl:'view/template/foot.html'
		}
	}]);
	'use strict';
	angular.module('app')
	.directive('appHead',['cache',function(cache){
		return{
			restrict:'A',  //通过属性方式调用指令
			replace:true,  //替换外层父元素(只能有一个根元素)
			templateUrl:'view/template/head.html', //模板位置
			link:function($scope){
				$scope.name = cache.get('name') || '';
			}
		}
	}]);
	'use strict';
	angular.module('app').directive('appHeadBar',[function(){
		return {
			restrict:'A',
			replace:true,
			templateUrl:'view/template/headBar.html',
			scope:{
				text:'@'
			},
			link:function($scope){ //function(scope,element,attr){}完整参数 scope为形参所以有没有$都可以
				// console.log($scope.text);
				$scope.back=function(){
					window.history.back();
				};
			
			}
		};
	}]);
	'use strict';
	angular.module('app').directive('appPositionClass',[function(){
		return{
			restrict:'A',
			replace:true,
			scope:{
				com:'='
			},
			templateUrl:'view/template/positionClass.html',
			link:function($scope){
				$scope.showPositionList=function(index){
					$scope.positionList = $scope.com.positionClass[index].positionList;
					// console.log($scope.positionList);
					$scope.isActive=index;
				}
				$scope.$watch('com',function(newVal){  //监听com变化,com为属性名称，也可写函数与式
					if(newVal) $scope.showPositionList(0);
				});
			}
		};
	}]);
	'use strict';
	angular.module("app").directive('appPositionInfo',['$http',function($http) {
		return {
			restrict:'A',
			replace:true,
			templateUrl:'view/template/positionInfo.html',
			scope:{
				isActive:'=',
				isLogin:'=',
				pos:'='
			},
			link:function($scope){
				$scope.$watch('pos',function(newVal){
					if(newVal){
						$scope.pos.select = $scope.pos.select || false;
						$scope.imagePath = $scope.pos.select?'image/star-active.png':'image/star.png';
					}
				});
				$scope.favorite = function(){
					$http.post('data/favorite.json',{
						id:$scope.pos.id,
						select:!$scope.pos.select
					}).success(function(resp){
						$scope.pos.select = !$scope.pos.select;
						$scope.imagePath = $scope.pos.select?'image/star-active.png':'image/star.png';						
					});
				}
			}
		};
	}]);
	'use strict';
	angular.module('app')
	.directive('appPositionList',['$http',function($http) {
		return {
			restrict:'A',
			replace:true,
			templateUrl:'view/template/positionList.html',
			scope:{
				data:'=', //这样就与controller中的$scope共享（仅限属性共享）
				filterObj:'=',
				isFavorite:'='
			},
			link:function($scope){
				$scope.select = function(item){
					$http.post('data/favorite.json',{
						id:item.id,
						select:!item.select
					}).success(function(resp){
						item.select = !item.select;
					});
				};
			}
		};
	}]);
	'use strict';
	angular.module('app')
	.directive('appSheet', [function(){
		return {
			restrict:'A',
			replace:true,
			scope:{
				list:'=',
				visible:'=',
				select:'&'
			},
			templateUrl:'view/template/sheet.html'
		};
	}]);
	'use strict';
	angular.module('app')
	.directive('appTab', [function(){
		return {
			restrict:'A',
			replace:true,
			scope:{
				list:'=', //数据暴露API
				tabClick:'&'   //&指代传入函数
			},
			templateUrl:'view/template/tab.html',
			link:function($scope){
				$scope.click = function(tab){
					$scope.selectId = tab.id;
					$scope.tabClick(tab); //通知父控制器已经被点击了
				}
			}
		};
	}]);
	'use strict';
	angular.module('app')
	.filter('filterByObj',[function () {
		return function(arr,obj){
			var result = [];
			angular.forEach(arr,function(item){
				var isEqual = true;
				for(var e in obj){
					if(item[e]!==obj[e]){
						isEqual = false;
					}
				}
				if(isEqual) {
					result.push(item);
				}
			});
			return result;
		};
	}]);
	'use strict';
	angular.module('app')
	.service('cache',['$cookies',function ($cookies) {
		this.put=function(key,value){
			$cookies.put(key,value);
		};
		this.get=function(key){
			return $cookies.get(key);
		};
		this.remove=function(key){
			return $cookies.remove(key);
		};
	}]);
	/*.factory('cache',['$cookies',function ($cookies) {
		return {
			put:function(key,value){
			$cookies.put(key,value);
			},
			get:function(key){
				return $cookies.get(key);
			},
			remove:function(key){
				return $cookies.remove(key);
			}
		};
	}]);*/

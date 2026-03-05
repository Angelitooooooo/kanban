var Service = require('node-windows').Service;
var svc = new Service({
 name:'KanbanServer',
 description: 'Kanban service for task management',
 script: 'C:\\Users\\otile\\Desktop\\Kanban System\\server\\index.js'
});

svc.on('install',function(){
 svc.start();
});

svc.install();
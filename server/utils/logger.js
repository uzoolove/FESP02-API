import tracer from 'tracer';
if(process.env.NODE_ENV == 'production'){
  var logger = tracer.dailyfile({
    root: 'logs',
    maxLogFiles: 365,
    allLogsFileName: 'log',
    level: 3,  // log(0), trace(1), debug(2), info(3), warn(4), error(5), fatal(6)
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}}({{method}}()) {{message}}'],
    dateformat: 'yyyy-mm-dd HH:MM:ss',
    inspectOpt: {
      depth: 5
    }  
  });
}else{
  var logger = tracer.colorConsole({
    level: 0,  // log(0), trace(1), debug(2), info(3), warn(4), error(5), fatal(6)
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}}({{method}}()) {{message}}'],
    dateformat: 'yyyy-mm-dd HH:MM:ss',
    inspectOpt: {
      depth: 10
    }
  });
}

export default logger;

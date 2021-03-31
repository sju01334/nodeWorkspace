/*
클라이언트 요청을 받을 웹서버를 구축한다(두번째 실습)
*/

/*나의 아이피
http://내 아이피:9999
http://localhost:9999
http://127.0.0.1:9999
*/
var http=require("http"); //http 모듈(웹서버 모듈)을 가져오기

 var server = http.createServer();

//  클라이언트의 접속을 감지해보자
server.on("connection", function(){
    console.log("클라이언트의 접속을 감지")
})
//클라이언트의 요청에 대해 응답을 해보자
 server.listen(9999, function(){
     console.log("Second Server is running at 9999 port...")
 }); //클라이언트의 접속을 기다림
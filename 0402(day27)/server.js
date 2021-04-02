var http=require("http");
var fs=require("fs");

var server=http.createServer(function(request, response){
    //request : 클라이언트의 요청 정보
    //response : 클라이언트에게 보낼 응답 정보

    // fs.readFile("파일명", "인코딩", 읽었을때 실행할 함수)
    fs.readFile("./regist_form.html", "utf8", function(err, data){
        //클라이언트에게 지정한 문자열 전송
        //HTTP 의 형식을 갖추어서 클라이언트에게 응답을 해보자
        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"}); //header 정보를 제대로 갖추어서 응답하자
        response.end(data);

    });


});

server.listen(7878, function(){
    console.log("My Server is running at 7878");
});//서버가동

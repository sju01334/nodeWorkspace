/*
Node.js의 기본 모듈만으로는, 서버를 구축할수는 있으나, 개발자가 처리해야할 업무가 너무 많고
효율성이 떨어진다. 따라서 기본 모듈 외에, http 모듈을 좀더 개선한 express 모듈을 사용해 보자
주의) http 기본 모듈이 사용되지 않는 것이 아니라, 이 기본 모듈에 express 모듈을 추가해서 사용한다.

[express 모듈의 특징]
1) 정적자원에 대한 처리가 이미 지원된다.. 즉 개발자가 각 지원마다 1:1대응하는 코드를 작성할 필요가 없다
2) Get / Post 등의 http 요청에 대한 파라미터 처리가 쉽다
3) 미들웨어라 불리는 use() 메서드를 통해 기능을 확장한다.\
*/
var http=require("http");
var express=require("express");
var static=require("serve-static")//정적 자원을 쉽게 접근하기 위한 미들웨어 추가
var app=express(); //express 모듈통해 객체 생성

// 서버의 정적자원에 접근을 위해 static() 미들웨어를 사용해본다 <----> dynamic(동적)
//__dirname 전역변수는? 현재 실행중인 js 파일의 디렉토리 위치를 반환
//즉 현재 실행중인 server.js 의 디렉토리를 반환!!

console.log("이미지 정적자원에 들어있는 풀 경로는", __dirname+"/images")
app.use(static(__dirname+"/images"));



var server=http.createServer(app);//http 서버에 express 모듈을 적용
server.listen(8989, function(){
    console.log("The server using Express module is running at 8989...")
});

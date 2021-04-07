/*
Node.js의 기본 모듈만으로는, 서버를 구축할수는 있으나, 개발자가 처리해야할 업무가 너무 많고
효율성이 떨어진다. 따라서 기본 모듈 외에, http 모듈을 좀더 개선한 express 모듈을 사용해 보자
주의) http 기본 모듈이 사용되지 않는 것이 아니라, 이 기본 모듈에 express 모듈을 추가해서 사용한다.

[express 모듈의 특징]
1) 정적자원에 대한 처리가 이미 지원된다.. 즉 개발자가 각 지원마다 1:1대응하는 코드를 작성할 필요가 없다
    html, images, css, sound, mp4, js(클라이언트 측) , txt 서버에서 실행되지 않는 모든 리소스
2) Get / Post 등의 http 요청에 대한 파라미터 처리가 쉽다
3) 미들웨어라 불리는 use() 메서드를 통해 기능을 확장한다.
*/
var http=require("http");
var express=require("express");
var static=require("serve-static");//정적 자원을 쉽게 접근하기 위한 미들웨어 추가
var fs=require("fs");
var ejs=require("ejs");//서버측 스크립트인 ejs 관련 모듈
var mysql=require("mysql"); 
var mymodule=require("./lib/mymodule.js");
var app=express(); //express 모듈통해 객체 생성


//mysql 접속 정보
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
}

// 서버의 정적자원에 접근을 위해 static() 미들웨어를 사용해본다 <----> dynamic(동적)
//__dirname 전역변수는? 현재 실행중인 js 파일의 디렉토리 위치를 반환
//즉 현재 실행중인 server.js 의 디렉토리를 반환!!

// console.log("이미지 정적자원에 들어있는 풀 경로는", __dirname+"/images")
app.use(static(__dirname+"/static")); //static 을 정적자원이 있는 루트로 지정
app.use(express.urlencoded({
    extended:true
})); //post 방식의 데이터를 처리할 수 있도록


/*---------------------------------------------------------
클라이언트의 요청처리!! 요청 url에 대한 조건문 x, 정적 자원에대한 처리 필요 x
CRUD - Create(=insert) / Read(=select) / Upadate / Delete
---------------------------------------------------------*/
app.get("/notice/list",function(request,response){
    //select 문 수행
    var con=mysql.createConnection(conStr);//접속 시도후 Connection 객체 반환
    con.query("select * from notice order by notice_id desc", function(err, result, fields){
        if(err){
            console.log(err); //에러 분석을 위해 콘솔 화면에 로그를 남김
       }else{
        //    console.log("result는 ", result);
        //    console.log("fields는 ", fields);
           fs.readFile("./notice/list.ejs","utf8",function(err,data){
               response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
               //읽기만 하는게 아니라 서버에서 실행까지 해야하므로 render() 메서드를 이용하여 %%영역을
               //클라이언트에게 보내기 전에 서버측에서 먼저 실행을 해버리자
               response.end(ejs.render(data,{
                    noticeList:result,
                    lib:mymodule
               }));
           });
       }
       con.end(); //mysql 접속 끊기
    });
});
//지정한 post 방식dmfh 클라이언트의 요청을 받음
app.post("/notice/regist", function(request, response){
    //1) 클라이언트가 전송한 파라미터들을 받자
    // console.log(request.body);
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;

    //2) mysql 접속
    var con=mysql.createConnection(conStr); //접속 후 Connection 객체 반환

    //3) 쿼리실행
    /*
    var sql="insert into notice(title, writer, content)";
    sql+=" values('"+title+"','"+writer+"','"+content+"')";
    */
    //바인드 변수르르 이용하면, 따옴표 문제를 고민하지 않아도 됨, 단 주의!
    //바인드 변수의 사용목적은 따옴표 때문이 아니라, DB 성능과 관련이있다 (java 시간에 자세히 할 예정)
    var sql="insert into notice(title, writer, content) values(?,?,?)";

    con.query(sql, [title, writer, content], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end("<script>alert('등록성공');location.href='/notice/list';</script>");
        }
        con.end();
    });
});
//목록요청 처리
app.get("/notice/detail", function(request, response){
    //get 방식으로 , 헤더를 통해 전송되어온 파라미터를 확인해보자
    // console.log(request.query);
    var notice_id=request.query.notice_id;
    // var sql="select * from notice where notice_id="+notice_id;
    var sql="select * from notice where notice_id=?";

    var con=mysql.createConnection(conStr);
    con.query(sql, [notice_id], function(err, result, fields){
        // console.log(result);
        if(err){
            console.log(err);
        }else{
            //디자인 보여주기 전에 조회수도 증가시키자
            con.query("update notice set hit=hit+1 where notice_id=?;", [notice_id],function(er, fields){
                if(er){
                    console.log(er);
                }else{
                    fs.readFile("./notice/detail.ejs", "utf8", function(error, data){
                        if(error){
                            console.log(error);
                        }else{
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(ejs.render(data,{
                                //result는 한건이라고 할지라도 배열이므로, 배열에서 꺼내서 보여주자
                                record:result[0]
                            }));
                        }
                    });
                }
                con.end(); //mysql 접속 끊기
            });
        }
       
    });
});

//글 수정요청 처리
app.post("/notice/edit", function(request, response){
    //파라미터 받기
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var notice_id=request.body.notice_id;

    // console.log("title은", title);
    // console.log("writer는", writer);
    // console.log("content는", content);
    // console.log("notice_id는", notice_id);

    //파라미터가 총 4개 필요
    var sql="update notice set title=?, writer=?, content=? where notice_id=?";

    var con=mysql.createConnection(conStr);

    con.query(sql, [title, writer, content, notice_id], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("수정 성공","/notice/detail?notice_id="+notice_id));
        }
        con.end();//mysql 연결 종류
    });
});

//삭제요청
app.post("/notice/del", function(request, response){
    
    var notice_id=request.body.notice_id;
    // console.log("넘겨받은 id", notice_id);
    var sql="delete from notice where notice_id=?";

    var con=mysql.createConnection(conStr);
    con.query(sql, [notice_id], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("삭제 성공","/notice/list"));
        }
        con.end();
    });
});

var server=http.createServer(app);//http 서버에 express 모듈을 적용
server.listen(8989, function(){
    console.log("The server using Express module is running at 8989...")
});

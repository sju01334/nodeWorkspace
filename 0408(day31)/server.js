var http = require("http");
//클라이언트가 업로드한 바이너리 데이터 처리를 위한 모듈
var multer=require("multer"); //외부모듈
// var oracledb=require("oracledb");//외부
var mysql=require("mysql");
var mymodule=require("./lib/mymodule.js");
var fs=require("fs"); //내장 모듈
var ejs=require("ejs"); //외부모듈
var path=require("path"); //파일의 경로와 관련되어 유용한 기능을 보유한 모듈, 확장자를 추출하는 기능 포함
var express = require("express");

var app = express(); //express객체 생성

//필요한 각종 미들웨어 적용
app.use(express.static(__dirname+"/static"));

//업로드 모듈을 이용한 업로드 처리 storage:저장할 곳, filename:저장할 이름
//노드 js 뿐만이 아니라, asp,php, jsp 등등은 일단 업로드 컴포넌트를 사용할 경우
//모든 post는 이 업로드 컴포넌트를 통해 처리된다.
var upload=multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
            cb(null, __dirname+"/static/upload");
        },
        filename:function(request, file, cb){
            // console.log("file is", file);
            //업로드한 파일에 따라서 파일 확장자는 틀려진다. 프로그래밍적으로 정보를 추출할것!
            //path.extname(originalname) 의 결과는 jpg.png
            console.log("업로드된 파일의 확장자는", path.extname(file.originalname));
            cb(null, new Date().valueOf()+path.extname(file.originalname));
        }
    })
});

//mysql 접속 정보 
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};
//글목 요청 처리
app.get("/gallery/list", function(request, response){
    var con=mysql.createConnection(conStr);
    var sql="select * from gallery order by gallery_id desc"; //내림차순
    con.query(sql, function(err, result, fields){
        if(err){
            console.log(err);
        }else{
            //ejs 렌더링
            fs.readFile("./gallery/list.ejs", "utf8", function(error, data){
                if(error){
                    console.log(error)
                }else{
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        galleryList:result,
                        lib:mymodule
                    }));
                }
                con.end();
            });
        }
    });
})

//글등록 요청 처리 
app.post("/gallery/regist", upload.single("pic") ,function(request , response){
    //파라미터 받기
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var filename=request.file.filename;//multer를 이용했기 떄문에 기존의 request객체에 추가된 것
    console.log("filename 은", filename);
    // console.log("request 객체는", request);

    var con=mysql.createConnection(conStr);
    var sql="insert into gallery(title, writer, content, filename) values(?, ?, ?, ?)";
    con.query(sql, [title, writer, content, filename], function(err, fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("등록완료","/gallery/list"));
        }
        con.end();
    });
});

//상세보기
app.get("/gallery/detail", function(request, response){
    var con=mysql.createConnection(conStr);
    var gallery_id=request.query.gallery_id;

    var sql="select * from gallery where gallery_id="+gallery_id;
    //쿼리문 수행
    con.query(sql,function(err, result, fields){
        if(err){
            console.log(err)
        }else{
            //상세페이지 보여주기
            fs.readFile("./gallery/detail.ejs", "utf8", function(error, data){
                if(error){
                    console.log(error)
                }else{
                    var d=ejs.render(data, {
                        gallery:result[0]
                    });
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(d);
                }
                con.end();
            });
        }
    });
});

//삭제요청 처리(DB삭제+이미지 삭제)
//파일을 업로드 하건, 안하건 일단 multer를 사용하게 되면, 모든 post방식에 관여하게 되어있다
//(node.js 의 특징)
app.post("/gallery/del",upload.single("pic"), function(request, response){
    var gallery_id=request.body.gallery_id;
    var filename=request.body.filename

    console.log("gallery_id", gallery_id);

    fs.unlink(__dirname+"/static/upload/"+filename, function(err){
        if(err){
            console.log("삭제실패", err);
        }else{
            var sql="delete from gallery where gallery_id="+gallery_id;
            var con=mysql.createConnection(conStr); //접속 및 커넥션 객체 반환
            con.query(sql, function(error, fields){
                if(error){
                    console.log("삭제실패", error);
                }else{
                    //목록요청
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(mymodule.getMsgUrl("삭제완료","/gallery/list"));
                }
            })
        }
        con.end();
    });
});

app.post("/gallery/edit", upload.single("pic"), function(request, response){
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var filename=request.body.filename;
    var gallery_id=request.body.gallery_id;

    //업로드시, request객체의 json 속성 중 file 이라는 속성이 판단대상
    // console.log(request.file);

    if(request.file != undefined){//업로드를 원하는것(사진교체)
        console.log("사진을 교체합니다");
        //사진 지우기+db수정
        fs.unlink(__dirname+"/static/upload/"+filename, function(err){
            if(err){
                console.log("수정실패", err);
            }else{
                filename=request.file.filename; //새롭게 업로드된 파일명으로 교체
                var sql="update gallery set title=?, writer=?, content=?, filename=? where gallery_id=?";
                var con=mysql.createConnection(conStr); //mysql접속
                con.query(sql, [title, writer, content, filename, gallery_id], function(error, fields){
                    if(error){
                        console.log("수정실패", error);
                    }else{
                        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("수정완료","/gallery/detail?gallery_id="+gallery_id));
                    }
                    con.end();
                });
            }
        });
    }else{//(사진유지)
        var sql="update gallery set title=?, writer=?, content=? where gallery_id=?";
        var con=mysql.createConnection(conStr); //mysql접속
        con.query(sql, [title, writer, content, gallery_id], function(error, fields){
            if(error){
                console.log("수정실패",error)
            }else{
                response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("수정완료","/gallery/detail?gallery_id="+gallery_id));
            }
            con.end();
        });

    }

    //db만 변경(사진 유지)
});

var server = http.createServer(app); //기몬 모듈에 express 모듈 연결
server.listen(9999, function(){
    console.log("Gallery Server is running at 9999 port....");
});
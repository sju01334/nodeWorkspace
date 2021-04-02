/*
객체지향에서는 현실에서의 상속의 개념을 코드로 구현이 가능하다.
즉, 모든 자식이 보유해야할 공통 코드를, 자식 객체마다 코드를 중복
시키지 않고, 부모객체에 공통코드를 작성할 수 있다.
이러한 코드기법을 지원하는이유는 코드의재사용성과 유지보수성이다.( 시간, 돈 save)

이 클래스는 게임에 등장할 모든 객체의 최상위 객체이다
*/ 
class GameObject{
    constructor(container, src, width, height, x, y, velX, velY){
        this.container=container;
        this.img=document.createElement("img");
        this.src=src;
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y; 
        this.velX=velX;
        this.velY=velY;
        this.init();
    }
    init(){
        this.img.src=this.src;
        this.img.style.width=this.width+"px";
        this.img.style.height=this.height+"px";

        this.img.style.position="absolute";
        this.img.style.left=this.x+"px"
        this.img.style.top=this.y+"px"
         //부착
         this.container.appendChild(this.img);
    }
    tick(){
        //누구를 염두해두고 코드를 넣어두어야하나
        //자식이 누구일지, 그리고 어떤 움직임을 가질지 알수없으므로, 코드를 작성할 수 없다.
        // 이렇게 부모클래스가 내용없이(즉 몸체없이) 작성한 메소드를 가리켜, 추상메서드라하면,
        // 추상 메서드의 본 목적은 자신이 불완전하게 남겨놓는다.
        //기능을 자식에게 구현할 것을 강제하기 위함이다
    }
    render(){

    }
}
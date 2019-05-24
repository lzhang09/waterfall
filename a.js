
class  WaterFall {
    constructor(node,obj){
        /**
         * @param node 父级容器的名字
         * @param data 传入的数据列表 图片列表 {Object} 每个对象中有一个src的属性
         * @param numberLine 单行要显示图片的数量
         * @param radio 图片宽高比
         * @param showOneImg 当只有一张图片是 是否铺满 默认是true 可设置int类型
         * 
         * 
         * @param boxWidth 容器宽度
         * @param completedImages 布局完毕的图片列表
         * 
         * 
        */
       var defaultOptions = {
           data:[],
           numberLine:6,
           radio:1.5,
           showOneImg:true,
       }
       this.options = this.extend({},defaultOptions,obj);

        this.node = $(node);
        //滚动条安全宽度20
        this.boxWidth = this.node.width()-20;
        console.log(this.boxWidth)
        this.completedImages = [];
        //假定高度
        this.assumeH = this.boxWidth / this.options.radio;

        this.getAllImagesWH(this.options.data).then(data=>{
            this.imagesLayout(data);
        })
        
        window.onresize = ()=>{
            this.afreshLayout()
        }
    }
    //获取所有图片的宽高和宽高比
    getAllImagesWH(images){
        images = images.map((element) =>{
            return new Promise((resolve)=>{
                let img = new Image();
                img.src = element.url; 
                if(img.complete){
                    let width = img.width;
                    let height = img.height;
                    let radio = width / height;
                    let assumeW = radio * this.assumeH;
                    let obj ={width,height,radio,assumeW,src:img.src}
                    resolve(obj)
                }else{
                    img.onload = ()=>{
                        let width = img.width;
                        let height = img.height;
                        let radio = width / height;
                        let assumeW = radio * this.assumeH;
                        let obj ={width,height,radio,assumeW,src:img.src}
                        resolve(obj)
                    } 
                }
            })
        })
        return Promise.all(images)
    }

    //图片布局
    imagesLayout(data){
        //当图片只有一张时,是否完整显示图片
        if(data.length === 1){   
            this.computedOneImages(data[0]);
        }else{
            //图片大于一张,排序分行处理
            let imagesBox = [];
            for(let i = 0,l = data.length;i<l;i++){
                imagesBox.push(data[i]);
                //当达到图片布局限制的数量时
                //当已经是最后一张图片时
                if(imagesBox.length === this.options.numberLine || i === data.length - 1){
                    this.computedImagesLayout(imagesBox);
                    imagesBox = [];
                }
            }
        }
        this.appendNode()

    }

   

    //分块计算图片信息
    computedImagesLayout(imagesBox){
        //当分组只有一张图片时
        if(imagesBox.length === 1){
            this.computedOneImages(imagesBox[0])
        }else{
            this.computedMoreImages(imagesBox);
        }
    }

    //单张图片布局
     computedOneImages(item){
        let w = 0;
        console.log(this.options)
        //判断是否将图片平铺
        if(isNaN(this.options.showOneImg)){
            w = this.boxWidth;
        }else{
            console.log(123)
            w = this.options.showOneImg;
        }
        item.actualW = w;
        item.actualH = w / item.radio;
        this.completedImages.push(item)
    }
    //分组中多张图片布局
    computedMoreImages(imagesBox){
        //计算出图片叠加的总和
        let totalWidth =imagesBox.reduce((sum,item)=>{
            return sum + item.assumeW;
        },0)
        //每行的实际行高
        let lineHeight = 0;
        //leftWidth为图片填充完剩余每行的宽度
        let leftWidth = this.boxWidth;
        imagesBox.forEach((item,i) => {
            if(i === 0){
                //第一张图片 计算出行高
                //每一行第一张图片在盒子中占的宽度
                item.actualW = parseInt(this.boxWidth * (imagesBox[i].assumeW) / totalWidth);
                //每一行第一张图片的行高
                item.actualH = lineHeight = parseInt(item.actualW / item.radio);
                //计算剩余宽度
                leftWidth = leftWidth - item.actualW;
            }else if(i === imagesBox.length - 1){
                //最后一张图片的宽度 高度
                item.actualH = lineHeight;
                item.actualW = leftWidth;
            }else{
                //中间图片的实际宽度 高度
                item.actualH = lineHeight;
                item.actualW = parseInt(item.actualH * item.radio);
                //计算剩余宽度
                leftWidth = leftWidth - item.actualW;

            }
            this.completedImages.push(item)
            
        });
        console.log(this.completedImages)

    }

    //将图片放入容器中
    appendNode(){
        this.completedImages.forEach(item=>{
            let str =  `  <div class="item" style="width: ${item.actualW}px;height:${item.actualH}px">
                <img src="${item.src}" alt="">
            </div>`
            this.node.append(str);
        })
    }

    //页面重新布局
    afreshLayout(){
        let boxWidth = this.boxWidth;
        this.boxWidth = this.node.width() -20;
        console.log(this.boxWidth)
        let boxRadio = this.boxWidth/boxWidth;
        let arr = this.node.children();
        arr.each((index,item)=>{           
            let w = $(item).outerWidth() * boxRadio;
            let h = $(item).outerHeight() * boxRadio;
            $(item).css({'width':w,'height':h})
        })
    }

    //参数赋值
    extend(target) {
        for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key];
        }

        for (var i = 0; i < rest.length; i++) {
            var source = rest[i];
            for (var key in source) {
            target[key] = source[key];
            }
        }
        return target;
    }

}(jQuery)
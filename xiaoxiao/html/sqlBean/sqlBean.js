
const type_stand = new Map([["int","Integer"],["tinyint", "Integer"],["varchar","String"],["timestamp", "LocalDateTime"]])
/**
 * 截取字符串中间的内容
 * @param {*} code 截取代码快
 * @param {*} start 开始位置
 * @param {*} end 结束位置
 * @returns 
 */
function cut_start_end_out(code,start,end){
    let start_p=0;
    let end_p=code.length;
    if(start!=null){
        start_p=code.indexOf(start);
        if(start_p<0){
            start_p=0;
        }
        start_p=start_p+start.length;
    }
    if(end!=null){
        end_p=code.lastIndexOf(end);
        if(end_p<0){
            end_p=code.length;
        }
    }
    return code.substring(start_p,end_p);
}

function get_column(e, comment) {
    e = e.trim()
    let obj={};//字段对象
    //字段名
    if(e.startsWith("`")){
        e=e.substring(1);
        obj.name=e.substring(0,e.indexOf("`"));
    }else{
        obj.name=e.substring(0,e.indexOf(" "));
    }
    //字段驼峰转换
    //字段类型
    if(e.indexOf('(')>-1) {
        obj.type=e.substring(e.indexOf(obj.name)+obj.name.length+1, e.indexOf('(')).trim()
    } else {
        //防止某些字段不定义长度
        e = e.substring(e.indexOf(obj.name)+obj.name.length+1).trim()
        obj.type= e.substring(0, e.indexOf(" "))
    }
    obj.java_type=type_stand.get(obj.type)

    obj.name = formatToHump(obj.name)
    obj.comment = comment.substring(comment.indexOf('\'')+1, comment.lastIndexOf('\''))
    return obj;
}

function formatToHump(value) {
    return value.replace(/\_(\w)/g, (_, letter) => letter.toUpperCase())
}

function transform(temp) {
	var xmlhttp;
	if (window.XMLHttpRequest)
	{
		//  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		// IE6, IE5 浏览器执行代码
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
    
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
            var value = Mustache.render(xmlhttp.responseText, temp)
            document.getElementById('logAfterId').value = value;
		}
	}
	xmlhttp.open("GET","./bean.template",true);
	xmlhttp.send();
}
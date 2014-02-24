define(function(require, module, exports) {


    document.body.setAttribute("oncontextmenu", "return false;");

    window.div = document.getElementById("div");
    window.Quaternion = require("Quaternion");

 
    document.onmousemove = function(event) {
        //event.preventDefault();
        var button = event.which || event.button;
        if (button === 0) {
            return false;
        }
        else if (button === 1) {
            div.style.webkitTransform = "matrix3d("+new Quaternion(0,0,0,0).rotateWXYZ((event.clientX/window.innerWidth)*2*Math.PI, new Quaternion(0,0,1,0))+")";
        }
        else if (button === 2) {
            div.style.webkitTransform = "matrix3d("+new Quaternion(0,0,0,0).rotateWXYZ((event.clientX/window.innerWidth)*2*Math.PI, new Quaternion(0,1,0,0))+")";

        } else if (button === 3) {
            div.style.webkitTransform = "matrix3d("+new Quaternion(0,0,0,0).rotateWXYZ((event.clientX/window.innerWidth)*2*Math.PI, new Quaternion(0,0,0,1))+")";

        }

    }
    
});

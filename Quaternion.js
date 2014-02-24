/**
 * This module is to help with CSS rotations in 3d. 
 *
 */
define(function(require, exports, module) {

    var IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    var total = new Quaternion(1,0,0,0); // a placeholder for methods that need a quaternion.

    /** @constructor */
    function Quaternion() {
        this.matrix = null;
        this.w = null;
        this.x = null;
        this.y = null;
        this.z = null;
        
        // I was thinking that if you input a matrix, the constructor would
        // automatically compute <w,x,y,z>
        if (arguments.length === 15) {
            this.matrix = Array.prototype.slice.call(arguments, 0);
            // How should I get w,x,y,z in this case? ugh...
            // TODO solve 4x4 for w,x,y,z
        }
        else if (arguments.length === 4) {
            this.w = arguments[0];
            this.x = arguments[1];
            this.y = arguments[2];
            this.z = arguments[3];
        }
        else {
            this.matrix = IDENTITY;
        }
        return this;
    }

    /** @constant - BASE VECTOR */
    Quaternion.prototype.i = new function() {
        var i = [0,1,0,0, -1,0,0,0, 0,0,0,1, 0,0,-1,0];
        Object.freeze(i);
        return i;
    };

    /** @constant - BASE VECTOR */
    Quaternion.prototype.j = new function() {
        var j = [0,0,0,-1, 0,0,-1,0, 0,1,0,0, 1,0,0,0];
        Object.freeze(j);
        return j;
    };

    /** @constant - BASE VECTOR */
    Quaternion.prototype.k = new function() {
        var k = [0,0,-1,0, 0,0,0,1, 1,0,0,0, 0,-1,0,0];
        Object.freeze(k);
        return k;
    };

    /** @method - Short for scalar division by some nonzero, real k. */
    Quaternion.prototype.divide = function(k) {
        if (k===0) throw new Error("[Fatal] Quaternion division by zero.");
        else { 
            this.w /= k;
            this.x /= k;
            this.y /= k;
            this.z /= k;
        }
        return this;
    };

    /** @method - Multiplies this <w,x,y,z> by real k. */
    Quaternion.prototype.scalarMultiply = function(k) {
        this.w *= k;
        this.x *= k;
        this.y *= k;
        this.z *= k;
        return this;
    };

    /**
     * @method - By default, normalizes <w,x,y,z> to length == 1.
     * @param {Number} k - optionally scale the vector as (1/k). 
     */
    Quaternion.prototype.normalize = function(k) {
        k = (k === undefined) ? 1 : k;
        return this.divide(k * this.norm());
    }

    /**
     * @method - Returns the current rotation matrix using <w,x,y,z>.
     *           note: The current vector must first be normalized.
     *           more at: http://en.wikipedia.org/wiki/Rotation_matrix#Quaternion   
     */
    Quaternion.prototype.getMatrix = function() {
        var w,x,y,z;
        total.set.apply(total, this.get())
             .normalize();
        w = total.w;
        x = total.x;
        y = total.y;
        z = total.z;
        return [
            (1 - 2*y*y - 2*z*z), (2*x*y - 2*z*w)    , (2*x*z + 2*y*w)    , 0,
            (2*x*y + 2*z*w)    , (1 - 2*x*x - 2*z*z), (2*y*z - 2*x*w)    , 0,
            (2*x*z - 2*y*w)    , (2*y*z + 2*x*w)    , (1 - 2*x*x - 2*y*y), 0,
            0                  , 0                  , 0                  , 1
        ];            
    };

    /** @method - set vector <w,x,y,z> */
    Quaternion.prototype.set = function(w,x,y,z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    /** @method - get vector <w,x,y,z> */
    Quaternion.prototype.get = function(w,x,y,z) {
        return [this.w, this.x, this.y, this.z];
    };

    /**
     * @method - Returns the result of the dot product of this and some other quat.
     * @param {Quaternion} - Another quaternion with wich to preform a dot product.
     * @returns {Number} - result of dot product
     */
    Quaternion.prototype.dotProduct = function(quat){
        return (this.w*quat.w) + (this.x*quat.x) + (this.y*quat.y) + (this.z*quat.z);
    };

    /** 
     * @method 
     * @returns {Number} - length of the vector <w,x,y,z>
     */
    Quaternion.prototype.norm = function() {
        return Math.sqrt(this.dotProduct(this));
    };

    /** @method - Rotate by angle theta */
    Quaternion.prototype.rotate = function(theta, vector) {
        // q  = [cos (theta), sin (theta) * v_UNIT]
        // p  = [0, p]
        // p' = qp
        var s,c; 
        var x,y,z;
        x = this.x;
        y = this.y;
        z = this.z;

        with (Math) {
            s = sin(theta);
            c = cos(theta);    
        }

        return ([
            c+x*x*(1-c)  , x*y*(1-c)    , x*z*(1-c)+y*s,    0,
            y*x*(1-c)+z*s, c+y*y*(1-c)  , y*z*(1-c)-x*s,    0,
            z*x*(1-c)-y*s, z*y*(1-c)+x*s, c+z*z*(1-c)  ,    0,
            0            , 0            , 0            ,    1
        ]);

    };

    Quaternion.prototype.rotateWXYZ = function(theta, axis) {
        var w,x,y,z;
        with (Math) {
            total.w = cos(theta/2);
            total.x = axis.x * sin(theta/2);
            total.y = axis.y * sin(theta/2);
            total.z = axis.z * sin(theta/2);
        }
        total.set.apply(total, total.get())
             .normalize();
        w = total.w;
        x = total.x;
        y = total.y;
        z = total.z;
        return [
            (1 - 2*y*y - 2*z*z), (2*x*y - 2*z*w)    , (2*x*z + 2*y*w)    , 0,
            (2*x*y + 2*z*w)    , (1 - 2*x*x - 2*z*z), (2*y*z - 2*x*w)    , 0,
            (2*x*z - 2*y*w)    , (2*y*z + 2*x*w)    , (1 - 2*x*x - 2*y*y), 0,
            0                  , 0                  , 0                  , 1
        ];
    };
        
    //Quaternion.prototype.conjugate

    /** 
     * @method - not optimized.
     */
    function multiply(A, B) {
        var m = new Array();    
        m[0] = A[0]*B[0] + A[1]*B[4] + A[2]*B[8] + A[3]*B[12];
        m[1] = A[0]*B[1] + A[1]*B[5] + A[2]*B[9] + A[3]*B[13];
        m[2] = A[0]*B[2] + A[1]*B[6] + A[2]*B[10] + A[3]*B[14];
        m[3] = A[0]*B[3] + A[1]*B[7] + A[2]*B[11] + A[3]*B[15];

        m[4] = A[4]*B[0] + A[5]*B[4] + A[6]*B[8] + A[7]*B[12];
        m[5] = A[4]*B[1] + A[5]*B[5] + A[6]*B[9] + A[7]*B[13];
        m[6] = A[4]*B[2] + A[5]*B[6] + A[6]*B[10] + A[7]*B[14];
        m[7] = A[4]*B[3] + A[5]*B[7] + A[6]*B[11] + A[7]*B[15];

        m[8] = A[8]*B[0] + A[9]*B[4] + A[10]*B[8] + A[11]*B[12];
        m[9] = A[8]*B[1] + A[9]*B[5] + A[10]*B[9] + A[11]*B[13];
        m[10] = A[8]*B[2] + A[9]*B[6] + A[10]*B[10] + A[11]*B[14];
        m[11] = A[8]*B[3] + A[9]*B[7] + A[10]*B[11] + A[11]*B[15];

        m[12] = A[12]*B[0] + A[13]*B[4] + A[14]*B[8] + A[15]*B[12];
        m[13] = A[12]*B[1] + A[13]*B[5] + A[14]*B[9] + A[15]*B[13];
        m[14] = A[12]*B[2] + A[13]*B[6] + A[14]*B[10] + A[15]*B[14];
        m[15] = A[12]*B[3] + A[13]*B[7] + A[14]*B[11] + A[15]*B[15];

        return m; 
    }


    module.exports = Quaternion;
});

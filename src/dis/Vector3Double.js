/**
 * Section 5.3.34. Three double precision floating point values, x, y, and z
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.Vector3Double = function()
{
   /** 
    * X value 
    * @type {number}
    * @instance
    */
   this.x = 0;

   /** 
    * Y value 
    * @type {number}
    * @instance
    */
   this.y = 0;

   /** 
    * Z value 
    * @type {number}
    * @instance
    */
   this.z = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.Vector3Double.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat64();
       this.y = inputStream.readFloat64();
       this.z = inputStream.readFloat64();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.Vector3Double.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.x);
       outputStream.writeFloat64(this.y);
       outputStream.writeFloat64(this.z);
  };
}; // end of class

 // node.js module support
exports.Vector3Double = dis.Vector3Double;

// End of Vector3Double class


/**
 * 5.2.2: angular velocity measured in radians per second out each of the entity's own coordinate axes.
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
dis.AngularVelocityVector = function()
{
   /**
    * velocity about the x axis
    * @type {number}
    * @instance
    */
   this.x = 0;

   /**
    * velocity about the y axis
    * @type {number}
    * @instance
    */
   this.y = 0;

   /**
    * velocity about the z axis
    * @type {number}
    * @instance
    */
   this.z = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.AngularVelocityVector.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
       this.z = inputStream.readFloat32();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.AngularVelocityVector.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
       outputStream.writeFloat32(this.z);
  };
}; // end of class

 // node.js module support
exports.AngularVelocityVector = dis.AngularVelocityVector;

// End of AngularVelocityVector class


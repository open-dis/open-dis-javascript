/**
 * Two floating point values, x, y
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Vector2Float = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

  dis.Vector2Float.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
  };

  dis.Vector2Float.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
  };
}; // end of class

 // node.js module support
exports.Vector2Float = dis.Vector2Float;

// End of Vector2Float class


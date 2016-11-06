/**
 * Operational data for describing the vectoring nozzle systems Section 6.2.96
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.VectoringNozzleSystem = function()
{
   /** In degrees */
   this.horizontalDeflectionAngle = 0;

   /** In degrees */
   this.verticalDeflectionAngle = 0;

  dis7.VectoringNozzleSystem.prototype.initFromBinary = function(inputStream)
  {
       this.horizontalDeflectionAngle = inputStream.readFloat32();
       this.verticalDeflectionAngle = inputStream.readFloat32();
  };

  dis7.VectoringNozzleSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.horizontalDeflectionAngle);
       outputStream.writeFloat32(this.verticalDeflectionAngle);
  };
}; // end of class

 // node.js module support
exports.VectoringNozzleSystem = dis7.VectoringNozzleSystem;

// End of VectoringNozzleSystem class


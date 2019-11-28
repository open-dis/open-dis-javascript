/**
 * Grid axis record for fixed data. Section 6.2.41
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


dis.GridAxis = function()
{
   /** coordinate of the grid origin or initial value */
   this.domainInitialXi = 0;

   /** coordinate of the endpoint or final value */
   this.domainFinalXi = 0;

   /** The number of grid points along the Xi domain axis for the enviornmental state data */
   this.domainPointsXi = 0;

   /** interleaf factor along the domain axis. */
   this.interleafFactor = 0;

   /** type of grid axis */
   this.axisType = 0;

   /** Number of grid locations along Xi axis */
   this.numberOfPointsOnXiAxis = 0;

   /** initial grid point for the current pdu */
   this.initialIndex = 0;

  dis.GridAxis.prototype.initFromBinary = function(inputStream)
  {
       this.domainInitialXi = inputStream.readFloat64();
       this.domainFinalXi = inputStream.readFloat64();
       this.domainPointsXi = inputStream.readUShort();
       this.interleafFactor = inputStream.readUByte();
       this.axisType = inputStream.readUByte();
       this.numberOfPointsOnXiAxis = inputStream.readUShort();
       this.initialIndex = inputStream.readUShort();
  };

  dis.GridAxis.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.domainInitialXi);
       outputStream.writeFloat64(this.domainFinalXi);
       outputStream.writeUShort(this.domainPointsXi);
       outputStream.writeUByte(this.interleafFactor);
       outputStream.writeUByte(this.axisType);
       outputStream.writeUShort(this.numberOfPointsOnXiAxis);
       outputStream.writeUShort(this.initialIndex);
  };
}; // end of class

 // node.js module support
exports.GridAxis = dis.GridAxis;

// End of GridAxis class


/**
 * DE energy depostion properties for a target entity. Section 6.2.20.4
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.DirectedEnergyTargetEnergyDeposition = function()
{
   /** Unique ID of the target entity. */
   this.targetEntityID = new null.EntityID(); 

   /** padding */
   this.padding = 0;

   /** Peak irrandiance */
   this.peakIrradiance = 0;

  null.DirectedEnergyTargetEnergyDeposition.prototype.initFromBinary = function(inputStream)
  {
       this.targetEntityID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.peakIrradiance = inputStream.readFloat32();
  };

  null.DirectedEnergyTargetEnergyDeposition.prototype.encodeToBinary = function(outputStream)
  {
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.peakIrradiance);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyTargetEnergyDeposition = null.DirectedEnergyTargetEnergyDeposition;

// End of DirectedEnergyTargetEnergyDeposition class


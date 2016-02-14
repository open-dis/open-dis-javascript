/**
 * Shaft RPMs, used in underwater acoustic clacluations.
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


null.ShaftRPMs = function()
{
   /** Current shaft RPMs */
   this.currentShaftRPMs = 0;

   /** ordered shaft rpms */
   this.orderedShaftRPMs = 0;

   /** rate of change of shaft RPMs */
   this.shaftRPMRateOfChange = 0;

  null.ShaftRPMs.prototype.initFromBinary = function(inputStream)
  {
       this.currentShaftRPMs = inputStream.readShort();
       this.orderedShaftRPMs = inputStream.readShort();
       this.shaftRPMRateOfChange = inputStream.readFloat32();
  };

  null.ShaftRPMs.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeShort(this.currentShaftRPMs);
       outputStream.writeShort(this.orderedShaftRPMs);
       outputStream.writeFloat32(this.shaftRPMRateOfChange);
  };
}; // end of class

 // node.js module support
exports.ShaftRPMs = null.ShaftRPMs;

// End of ShaftRPMs class


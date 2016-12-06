/**
 * Physical separation of an entity from another entity.  Section 6.2.94.6
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


dis.SeparationVP = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 2;

   /** Reason for separation. EBV */
   this.reasonForSeparation = 0;

   /** Whether the entity existed prior to separation EBV */
   this.preEntityIndicator = 0;

   /** padding */
   this.padding1 = 0;

   /** ID of parent */
   this.parentEntityID = new dis.EntityID(); 

   /** padding */
   this.padding2 = 0;

   /** Station separated from */
   this.stationLocation = 0;

  dis.SeparationVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.reasonForSeparation = inputStream.readUByte();
       this.preEntityIndicator = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.parentEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.stationLocation = inputStream.readUInt();
  };

  dis.SeparationVP.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.reasonForSeparation);
       outputStream.writeUByte(this.preEntityIndicator);
       outputStream.writeUByte(this.padding1);
       this.parentEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUInt(this.stationLocation);
  };
}; // end of class

 // node.js module support
exports.SeparationVP = dis.SeparationVP;

// End of SeparationVP class


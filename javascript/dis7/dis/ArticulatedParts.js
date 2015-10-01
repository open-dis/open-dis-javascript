/**
 *  articulated parts for movable parts and a combination of moveable/attached parts of an entity. Section 6.2.94.2
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


dis.ArticulatedParts = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 0;

   /** indicate the change of any parameter for any articulated part. Starts at zero, incremented for each change  */
   this.changeIndicator = 0;

   /** the identification of the articulated part to which this articulation parameter is attached. This field shall be specified by a 16-bit unsigned integer. This field shall contain the value zero if the articulated part is attached directly to the entity. */
   this.partAttachedTo = 0;

   /** the type of parameter represented, 32 bit enumeration */
   this.parameterType = 0;

   /** The definition of the 64 bits shall be determined based on the type of parameter specified in the Parameter Type field  */
   this.parameterValue = 0;

  dis.ArticulatedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis.ArticulatedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ArticulatedParts = dis.ArticulatedParts;

// End of ArticulatedParts class


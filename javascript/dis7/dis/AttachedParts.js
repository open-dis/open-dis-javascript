/**
 * Removable parts that may be attached to an entity.  Section 6.2.93.3
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


dis.AttachedParts = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 1;

   /** 0 = attached, 1 = detached. See I.2.3.1 for state transition diagram */
   this.detachedIndicator = 0;

   /** the identification of the articulated part to which this articulation parameter is attached. This field shall be specified by a 16-bit unsigned integer. This field shall contain the value zero if the articulated part is attached directly to the entity. */
   this.partAttachedTo = 0;

   /** The location or station to which the part is attached */
   this.parameterType = 0;

   /** The definition of the 64 bits shall be determined based on the type of parameter specified in the Parameter Type field  */
   this.parameterValue = 0;

  dis.AttachedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.detachedIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis.AttachedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.detachedIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.AttachedParts = dis.AttachedParts;

// End of AttachedParts class


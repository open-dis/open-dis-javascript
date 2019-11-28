/**
 * Effect of IO on an entity. Section 6.2.49.3
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


dis.IOEffect = function()
{
   this.recordType = 5500;

   this.recordLength = 16;

   this.ioStatus = 0;

   this.ioLinkType = 0;

   this.ioEffect = new dis.EntityID(); 

   this.ioEffectDutyCycle = 0;

   this.ioEffectDuration = 0;

   this.ioProcess = 0;

   this.padding = 0;

  dis.IOEffect.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.ioStatus = inputStream.readUByte();
       this.ioLinkType = inputStream.readUByte();
       this.ioEffect.initFromBinary(inputStream);
       this.ioEffectDutyCycle = inputStream.readUByte();
       this.ioEffectDuration = inputStream.readUShort();
       this.ioProcess = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.IOEffect.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUByte(this.ioStatus);
       outputStream.writeUByte(this.ioLinkType);
       this.ioEffect.encodeToBinary(outputStream);
       outputStream.writeUByte(this.ioEffectDutyCycle);
       outputStream.writeUShort(this.ioEffectDuration);
       outputStream.writeUShort(this.ioProcess);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.IOEffect = dis.IOEffect;

// End of IOEffect class


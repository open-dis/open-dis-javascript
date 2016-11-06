/**
 * Section 5.2.35. information about a specific UA emmtter
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


dis.AcousticEmitter = function()
{
   /** the system for a particular UA emitter, and an enumeration */
   this.acousticName = 0;

   /** The function of the acoustic system */
   this.function = 0;

   /** The UA emitter identification number relative to a specific system */
   this.acousticIdNumber = 0;

  dis.AcousticEmitter.prototype.initFromBinary = function(inputStream)
  {
       this.acousticName = inputStream.readUShort();
       this.function = inputStream.readUByte();
       this.acousticIdNumber = inputStream.readUByte();
  };

  dis.AcousticEmitter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticName);
       outputStream.writeUByte(this.function);
       outputStream.writeUByte(this.acousticIdNumber);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitter = dis.AcousticEmitter;

// End of AcousticEmitter class


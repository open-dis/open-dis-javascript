/**
 *  information about a specific UA emmtter. Section 6.2.2.
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
   this.acousticSystemName = 0;

   /** The function of the acoustic system */
   this.acousticFunction = 0;

   /** The UA emitter identification number relative to a specific system */
   this.acousticIDNumber = 0;

  dis.AcousticEmitter.prototype.initFromBinary = function(inputStream)
  {
       this.acousticSystemName = inputStream.readUShort();
       this.acousticFunction = inputStream.readUByte();
       this.acousticIDNumber = inputStream.readUByte();
  };

  dis.AcousticEmitter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticSystemName);
       outputStream.writeUByte(this.acousticFunction);
       outputStream.writeUByte(this.acousticIDNumber);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitter = dis.AcousticEmitter;

// End of AcousticEmitter class


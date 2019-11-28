/**
 * This field shall specify information about a particular emitter system. Section 6.2.23.
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


dis.EmitterSystem = function()
{
   /** Name of the emitter, 16 bit enumeration */
   this.emitterName = 0;

   /** function of the emitter, 8 bit enumeration */
   this.emitterFunction = 0;

   /** emitter ID, 8 bit enumeration */
   this.emitterIDNumber = 0;

  dis.EmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.emitterName = inputStream.readUShort();
       this.emitterFunction = inputStream.readUByte();
       this.emitterIDNumber = inputStream.readUByte();
  };

  dis.EmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.emitterName);
       outputStream.writeUByte(this.emitterFunction);
       outputStream.writeUByte(this.emitterIDNumber);
  };
}; // end of class

 // node.js module support
exports.EmitterSystem = dis.EmitterSystem;

// End of EmitterSystem class


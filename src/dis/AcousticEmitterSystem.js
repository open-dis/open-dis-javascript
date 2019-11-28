/**
 * 5.3.35: Information about a particular UA emitter shall be represented using an Acoustic Emitter System record. This record shall consist of three fields: Acoustic Name, Function, and Acoustic ID Number
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


dis.AcousticEmitterSystem = function()
{
   /** This field shall specify the system for a particular UA emitter. */
   this.acousticName = 0;

   /** This field shall describe the function of the acoustic system.  */
   this.acousticFunction = 0;

   /** This field shall specify the UA emitter identification number relative to a specific system. This field shall be represented by an 8-bit unsigned integer. This field allows the differentiation of multiple systems on an entity, even if in some instances two or more of the systems may be identical UA emitter types. Numbering of systems shall begin with the value 1.  */
   this.acousticID = 0;

  dis.AcousticEmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.acousticName = inputStream.readUShort();
       this.acousticFunction = inputStream.readUByte();
       this.acousticID = inputStream.readUByte();
  };

  dis.AcousticEmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticName);
       outputStream.writeUByte(this.acousticFunction);
       outputStream.writeUByte(this.acousticID);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitterSystem = dis.AcousticEmitterSystem;

// End of AcousticEmitterSystem class


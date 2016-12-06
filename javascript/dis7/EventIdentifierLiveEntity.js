/**
 * Identifies an event in the world. Use this format for ONLY the LiveEntityPdu. Section 6.2.34.
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


dis.EventIdentifierLiveEntity = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.eventNumber = 0;

  dis.EventIdentifierLiveEntity.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUByte();
       this.applicationNumber = inputStream.readUByte();
       this.eventNumber = inputStream.readUShort();
  };

  dis.EventIdentifierLiveEntity.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.siteNumber);
       outputStream.writeUByte(this.applicationNumber);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventIdentifierLiveEntity = dis.EventIdentifierLiveEntity;

// End of EventIdentifierLiveEntity class


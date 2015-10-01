/**
 * A communications node that is part of a simulted communcations network. Section 6.2.49.2
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


dis.IOCommunicationsNode = function()
{
   this.recordType = 5501;

   this.recordLength = 16;

   this.communcationsNodeType = 0;

   this.padding = 0;

   this.communicationsNodeID = new dis.CommunicationsNodeID(); 

  dis.IOCommunicationsNode.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.communcationsNodeType = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.communicationsNodeID.initFromBinary(inputStream);
  };

  dis.IOCommunicationsNode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUByte(this.communcationsNodeType);
       outputStream.writeUByte(this.padding);
       this.communicationsNodeID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IOCommunicationsNode = dis.IOCommunicationsNode;

// End of IOCommunicationsNode class


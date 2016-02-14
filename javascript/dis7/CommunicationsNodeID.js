/**
 * Identity of a communications node. Section 6.2.48.4
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.CommunicationsNodeID = function()
{
   this.entityID = new null.EntityID(); 

   this.elementID = 0;

  null.CommunicationsNodeID.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.elementID = inputStream.readUShort();
  };

  null.CommunicationsNodeID.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.elementID);
  };
}; // end of class

 // node.js module support
exports.CommunicationsNodeID = null.CommunicationsNodeID;

// End of CommunicationsNodeID class


/**
 * more laconically named EntityIdentifier
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


dis.EntityID = function()
{
   /** Site ID */
   this.siteID = 0;

   /** application number ID */
   this.applicationID = 0;

   /** Entity number ID */
   this.entityID = 0;

  dis.EntityID.prototype.initFromBinary = function(inputStream)
  {
       this.siteID = inputStream.readUShort();
       this.applicationID = inputStream.readUShort();
       this.entityID = inputStream.readUShort();
  };

  dis.EntityID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteID);
       outputStream.writeUShort(this.applicationID);
       outputStream.writeUShort(this.entityID);
  };
}; // end of class

 // node.js module support
exports.EntityID = dis.EntityID;

// End of EntityID class


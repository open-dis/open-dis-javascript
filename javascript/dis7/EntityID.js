/**
 * more laconically named EntityIdentifier
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


null.EntityID = function()
{
   /** Site ID */
   this.siteID = 0;

   /** application number ID */
   this.applicationID = 0;

   /** Entity number ID */
   this.entityID = 0;

  null.EntityID.prototype.initFromBinary = function(inputStream)
  {
       this.siteID = inputStream.readUShort();
       this.applicationID = inputStream.readUShort();
       this.entityID = inputStream.readUShort();
  };

  null.EntityID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteID);
       outputStream.writeUShort(this.applicationID);
       outputStream.writeUShort(this.entityID);
  };
}; // end of class

 // node.js module support
exports.EntityID = null.EntityID;

// End of EntityID class


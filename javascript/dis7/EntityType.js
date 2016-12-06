/**
 * Identifies the type of Entity
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


dis.EntityType = function()
{
   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field. Renamed from specific because that is a reserved word in SQL. */
   this.specific = 0;

   this.extra = 0;

  dis.EntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.EntityType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.EntityType = dis.EntityType;

// End of EntityType class


/**
 * Identifies the type and organization of an aggregate. Section 6.2.5
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


dis.AggregateType = function()
{
   /** Grouping criterion used to group the aggregate. Enumeration from EBV document */
   this.aggregateKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) Zero means domain does not apply. */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field. specific is a reserved word in sql. */
   this.specificInfo = 0;

   /** extra information needed to describe the aggregate */
   this.extra = 0;

  dis.AggregateType.prototype.initFromBinary = function(inputStream)
  {
       this.aggregateKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specificInfo = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.AggregateType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.aggregateKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specificInfo);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.AggregateType = dis.AggregateType;

// End of AggregateType class


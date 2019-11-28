/**
 * The unique designation of an environmental object. Section 6.2.64
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


dis.ObjectType = function()
{
   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.objectKind = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

  dis.ObjectType.prototype.initFromBinary = function(inputStream)
  {
       this.domain = inputStream.readUByte();
       this.objectKind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
  };

  dis.ObjectType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.domain);
       outputStream.writeUByte(this.objectKind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
  };
}; // end of class

 // node.js module support
exports.ObjectType = dis.ObjectType;

// End of ObjectType class


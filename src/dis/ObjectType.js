/**
 * Identifies type of object. This is a shorter version of EntityType that omits the specific and extra fields.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.ObjectType = function()
{
   /**
    * Kind of entity
    * @type {number}
    * @instance
    */
   this.entityKind = 0;

   /**
    * Domain of entity (air, surface, subsurface, space, etc)
    * @type {number}
    * @instance
    */
   this.domain = 0;

   /**
    * country to which the design of the entity is attributed
    * @type {number}
    * @instance
    */
   this.country = 0;

   /**
    * category of entity
    * @type {number}
    * @instance
    */
   this.category = 0;

   /**
    * subcategory of entity
    * @type {number}
    * @instance
    */
   this.subcategory = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.ObjectType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ObjectType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
  };
}; // end of class

 // node.js module support
exports.ObjectType = dis.ObjectType;

// End of ObjectType class


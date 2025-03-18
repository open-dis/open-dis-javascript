/**
 * Section 5.2.25. Identifies the type of radio
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
dis.RadioEntityType = function()
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
    * specific info based on subcategory field
    * @type {number}
    * @instance
    */
   this.nomenclatureVersion = 0;

   /**
    * @type {number}
    * @instance
    */
   this.nomenclature = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.RadioEntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.nomenclatureVersion = inputStream.readUByte();
       this.nomenclature = inputStream.readUShort();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.RadioEntityType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.nomenclatureVersion);
       outputStream.writeUShort(this.nomenclature);
  };
}; // end of class

 // node.js module support
exports.RadioEntityType = dis.RadioEntityType;

// End of RadioEntityType class


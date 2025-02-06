/**
 * Section 5.2.38. Identifies the type of aggregate including kind of entity, domain (surface, subsurface, air, etc) country, category, etc.
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
dis.AggregateType = function()
{
   /**
    * Kind of entity
    * @type {number}
    * @instance
    */
   this.aggregateKind = 0;

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
    * specific info based on subcategory field, sql has a reserved word for specific
    * @type {number}
    * @instance
    */
   this.specificInfo = 0;

   /**
    * @type {number}
    * @instance
    */
   this.extra = 0;

  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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


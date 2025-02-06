/**
 * 5.2.42. Basic operational data ofr IFF ATC NAVAIDS
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
dis.IffFundamentalData = function()
{
   /**
    * system status
    * @type {number}
    * @instance
    */
   this.systemStatus = 0;

   /**
    * Alternate parameter 4
    * @type {number}
    * @instance
    */
   this.alternateParameter4 = 0;

   /**
    * eight boolean fields
    * @type {number}
    * @instance
    */
   this.informationLayers = 0;

   /**
    * enumeration
    * @type {number}
    * @instance
    */
   this.modifier = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter1 = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter2 = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter3 = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter4 = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter5 = 0;

   /**
    * parameter, enumeration
    * @type {number}
    * @instance
    */
   this.parameter6 = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.IffFundamentalData.prototype.initFromBinary = function(inputStream)
  {
       this.systemStatus = inputStream.readUByte();
       this.alternateParameter4 = inputStream.readUByte();
       this.informationLayers = inputStream.readUByte();
       this.modifier = inputStream.readUByte();
       this.parameter1 = inputStream.readUShort();
       this.parameter2 = inputStream.readUShort();
       this.parameter3 = inputStream.readUShort();
       this.parameter4 = inputStream.readUShort();
       this.parameter5 = inputStream.readUShort();
       this.parameter6 = inputStream.readUShort();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.IffFundamentalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemStatus);
       outputStream.writeUByte(this.alternateParameter4);
       outputStream.writeUByte(this.informationLayers);
       outputStream.writeUByte(this.modifier);
       outputStream.writeUShort(this.parameter1);
       outputStream.writeUShort(this.parameter2);
       outputStream.writeUShort(this.parameter3);
       outputStream.writeUShort(this.parameter4);
       outputStream.writeUShort(this.parameter5);
       outputStream.writeUShort(this.parameter6);
  };
}; // end of class

 // node.js module support
exports.IffFundamentalData = dis.IffFundamentalData;

// End of IffFundamentalData class


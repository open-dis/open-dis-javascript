/**
 * 5.2.47.  Layer header.
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
dis.LayerHeader = function()
{
   /**
    * Layer number
    * @type {number}
    * @instance
    */
   this.layerNumber = 0;

   /**
    * Layer speccific information enumeration
    * @type {number}
    * @instance
    */
   this.layerSpecificInformaiton = 0;

   /**
    * information length
    * @type {number}
    * @instance
    */
   this.length = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformaiton = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformaiton);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = dis.LayerHeader;

// End of LayerHeader class


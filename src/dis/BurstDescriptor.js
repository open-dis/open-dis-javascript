/**
 * Section 5.2.7. Specifies the type of muntion fired, the type of warhead, the         type of fuse, the number of rounds fired, and the rate at which the roudns are fired in         rounds per minute.
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
dis.BurstDescriptor = function()
{
   /**
    * What munition was used in the burst
    * @type {EntityType}
    * @instance
    */
   this.munition = new dis.EntityType(); 

   /**
    * type of warhead
    * @type {number}
    * @instance
    */
   this.warhead = 0;

   /**
    * type of fuse used
    * @type {number}
    * @instance
    */
   this.fuse = 0;

   /**
    * how many of the munition were fired
    * @type {number}
    * @instance
    */
   this.quantity = 0;

   /**
    * rate at which the munition was fired
    * @type {number}
    * @instance
    */
   this.rate = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.BurstDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.munition.initFromBinary(inputStream);
       this.warhead = inputStream.readUShort();
       this.fuse = inputStream.readUShort();
       this.quantity = inputStream.readUShort();
       this.rate = inputStream.readUShort();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.BurstDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.munition.encodeToBinary(outputStream);
       outputStream.writeUShort(this.warhead);
       outputStream.writeUShort(this.fuse);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.rate);
  };
}; // end of class

 // node.js module support
exports.BurstDescriptor = dis.BurstDescriptor;

// End of BurstDescriptor class


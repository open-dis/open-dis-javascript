/**
 * 5.2.48: Linear segment parameters
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
dis.LinearSegmentParameter = function()
{
   /**
    * number of segments
    * @type {number}
    * @instance
    */
   this.segmentNumber = 0;

   /**
    * segment appearance
    * @type {SixByteChunk}
    * @instance
    */
   this.segmentAppearance = new dis.SixByteChunk(); 

   /**
    * location
    * @type {Vector3Double}
    * @instance
    */
   this.location = new dis.Vector3Double(); 

   /**
    * orientation
    * @type {Orientation}
    * @instance
    */
   this.orientation = new dis.Orientation(); 

   /**
    * segmentLength
    * @type {number}
    * @instance
    */
   this.segmentLength = 0;

   /**
    * segmentWidth
    * @type {number}
    * @instance
    */
   this.segmentWidth = 0;

   /**
    * segmentHeight
    * @type {number}
    * @instance
    */
   this.segmentHeight = 0;

   /**
    * segment Depth
    * @type {number}
    * @instance
    */
   this.segmentDepth = 0;

   /**
    * segment Depth
    * @type {number}
    * @instance
    */
   this.pad1 = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
  {
       this.segmentNumber = inputStream.readUByte();
       this.segmentAppearance.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.segmentLength = inputStream.readUShort();
       this.segmentWidth = inputStream.readUShort();
       this.segmentHeight = inputStream.readUShort();
       this.segmentDepth = inputStream.readUShort();
       this.pad1 = inputStream.readUInt();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.segmentNumber);
       this.segmentAppearance.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.segmentLength);
       outputStream.writeUShort(this.segmentWidth);
       outputStream.writeUShort(this.segmentHeight);
       outputStream.writeUShort(this.segmentDepth);
       outputStream.writeUInt(this.pad1);
  };
}; // end of class

 // node.js module support
exports.LinearSegmentParameter = dis.LinearSegmentParameter;

// End of LinearSegmentParameter class


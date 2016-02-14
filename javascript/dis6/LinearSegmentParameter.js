/**
 * 5.2.48: Linear segment parameters
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.LinearSegmentParameter = function()
{
   /** number of segments */
   this.segmentNumber = 0;

   /** segment appearance */
   this.segmentAppearance = new null.SixByteChunk(); 

   /** location */
   this.location = new null.Vector3Double(); 

   /** orientation */
   this.orientation = new null.Orientation(); 

   /** segmentLength */
   this.segmentLength = 0;

   /** segmentWidth */
   this.segmentWidth = 0;

   /** segmentHeight */
   this.segmentHeight = 0;

   /** segment Depth */
   this.segmentDepth = 0;

   /** segment Depth */
   this.pad1 = 0;

  null.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
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

  null.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
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
exports.LinearSegmentParameter = null.LinearSegmentParameter;

// End of LinearSegmentParameter class


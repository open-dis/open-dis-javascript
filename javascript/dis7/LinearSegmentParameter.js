/**
 * The specification of an individual segment of a linear segment synthetic environment object in a Linear Object State PDU Section 6.2.52
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


dis.LinearSegmentParameter = function()
{
   /** the individual segment of the linear segment  */
   this.segmentNumber = 0;

   /**  whether a modification has been made to the point object’s location or orientation */
   this.segmentModification = 0;

   /** general dynamic appearance attributes of the segment. This record shall be defined as a 16-bit record of enumerations. The values defined for this record are included in Section 12 of SISO-REF-010. */
   this.generalSegmentAppearance = 0;

   /** This field shall specify specific dynamic appearance attributes of the segment. This record shall be defined as a 32-bit record of enumerations. */
   this.specificSegmentAppearance = 0;

   /** This field shall specify the location of the linear segment in the simulated world and shall be represented by a World Coordinates record  */
   this.segmentLocation = new dis.Vector3Double(); 

   /** orientation of the linear segment about the segment location and shall be represented by a Euler Angles record  */
   this.segmentOrientation = new dis.EulerAngles(); 

   /** length of the linear segment, in meters, extending in the positive X direction */
   this.segmentLength = 0;

   /** The total width of the linear segment, in meters, shall be specified by a 16-bit unsigned integer. One-half of the width shall extend in the positive Y direction, and one-half of the width shall extend in the negative Y direction. */
   this.segmentWidth = 0;

   /** The height of the linear segment, in meters, above ground shall be specified by a 16-bit unsigned integer. */
   this.segmentHeight = 0;

   /** The depth of the linear segment, in meters, below ground level  */
   this.segmentDepth = 0;

   /** padding */
   this.padding = 0;

  dis.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
  {
       this.segmentNumber = inputStream.readUByte();
       this.segmentModification = inputStream.readUByte();
       this.generalSegmentAppearance = inputStream.readUShort();
       this.specificSegmentAppearance = inputStream.readUInt();
       this.segmentLocation.initFromBinary(inputStream);
       this.segmentOrientation.initFromBinary(inputStream);
       this.segmentLength = inputStream.readFloat32();
       this.segmentWidth = inputStream.readFloat32();
       this.segmentHeight = inputStream.readFloat32();
       this.segmentDepth = inputStream.readFloat32();
       this.padding = inputStream.readUInt();
  };

  dis.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.segmentNumber);
       outputStream.writeUByte(this.segmentModification);
       outputStream.writeUShort(this.generalSegmentAppearance);
       outputStream.writeUInt(this.specificSegmentAppearance);
       this.segmentLocation.encodeToBinary(outputStream);
       this.segmentOrientation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.segmentLength);
       outputStream.writeFloat32(this.segmentWidth);
       outputStream.writeFloat32(this.segmentHeight);
       outputStream.writeFloat32(this.segmentDepth);
       outputStream.writeUInt(this.padding);
  };
}; // end of class

 // node.js module support
exports.LinearSegmentParameter = dis.LinearSegmentParameter;

// End of LinearSegmentParameter class


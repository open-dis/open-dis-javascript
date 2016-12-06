/**
 * The Angle Deception attribute record may be used to communicate discrete values that are associated with angle deception jamming that cannot be referenced to an emitter mode. The values provided in the record records (provided in the associated Electromagnetic Emission PDU). (The victim radar beams are those that are targeted by the jammer.) Section 6.2.21.2.2
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


dis.AngleDeception = function()
{
   this.recordType = 3501;

   this.recordLength = 48;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.azimuthOffset = 0;

   this.azimuthWidth = 0;

   this.azimuthPullRate = 0;

   this.azimuthPullAcceleration = 0;

   this.elevationOffset = 0;

   this.elevationWidth = 0;

   this.elevationPullRate = 0;

   this.elevationPullAcceleration = 0;

   this.padding3 = 0;

  dis.AngleDeception.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.azimuthOffset = inputStream.readFloat32();
       this.azimuthWidth = inputStream.readFloat32();
       this.azimuthPullRate = inputStream.readFloat32();
       this.azimuthPullAcceleration = inputStream.readFloat32();
       this.elevationOffset = inputStream.readFloat32();
       this.elevationWidth = inputStream.readFloat32();
       this.elevationPullRate = inputStream.readFloat32();
       this.elevationPullAcceleration = inputStream.readFloat32();
       this.padding3 = inputStream.readUInt();
  };

  dis.AngleDeception.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeFloat32(this.azimuthOffset);
       outputStream.writeFloat32(this.azimuthWidth);
       outputStream.writeFloat32(this.azimuthPullRate);
       outputStream.writeFloat32(this.azimuthPullAcceleration);
       outputStream.writeFloat32(this.elevationOffset);
       outputStream.writeFloat32(this.elevationWidth);
       outputStream.writeFloat32(this.elevationPullRate);
       outputStream.writeFloat32(this.elevationPullAcceleration);
       outputStream.writeUInt(this.padding3);
  };
}; // end of class

 // node.js module support
exports.AngleDeception = dis.AngleDeception;

// End of AngleDeception class


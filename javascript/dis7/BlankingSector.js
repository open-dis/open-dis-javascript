/**
 * The Blanking Sector attribute record may be used to convey persistent areas within a scan volume where emitter power for a specific active emitter beam is reduced to an insignificant value. Section 6.2.21.2
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


dis.BlankingSector = function()
{
   this.recordType = 3500;

   this.recordLength = 40;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.leftAzimuth = 0;

   this.rightAzimuth = 0;

   this.lowerElevation = 0;

   this.upperElevation = 0;

   this.residualPower = 0;

   this.padding3 = 0;

   this.padding4 = 0;

  dis.BlankingSector.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.leftAzimuth = inputStream.readFloat32();
       this.rightAzimuth = inputStream.readFloat32();
       this.lowerElevation = inputStream.readFloat32();
       this.upperElevation = inputStream.readFloat32();
       this.residualPower = inputStream.readFloat32();
       this.padding3 = inputStream.readInt();
       this.padding4 = inputStream.readInt();
  };

  dis.BlankingSector.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeFloat32(this.leftAzimuth);
       outputStream.writeFloat32(this.rightAzimuth);
       outputStream.writeFloat32(this.lowerElevation);
       outputStream.writeFloat32(this.upperElevation);
       outputStream.writeFloat32(this.residualPower);
       outputStream.writeInt(this.padding3);
       outputStream.writeInt(this.padding4);
  };
}; // end of class

 // node.js module support
exports.BlankingSector = dis.BlankingSector;

// End of BlankingSector class


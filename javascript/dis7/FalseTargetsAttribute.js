/**
 * The False Targets attribute record shall be used to communicate discrete values that are associated with false targets jamming that cannot be referenced to an emitter mode. The values provided in the False Targets attri- bute record shall be considered valid only for the victim radar beams listed in the jamming beam's Track/Jam Data records (provided in the associated Electromagnetic Emission PDU). Section 6.2.21.3
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


dis.FalseTargetsAttribute = function()
{
   this.recordType = 3502;

   this.recordLength = 40;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.falseTargetCount = 0;

   this.walkSpeed = 0;

   this.walkAcceleration = 0;

   this.maximumWalkDistance = 0;

   this.keepTime = 0;

   this.echoSpacing = 0;

  dis.FalseTargetsAttribute.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.falseTargetCount = inputStream.readUShort();
       this.walkSpeed = inputStream.readFloat32();
       this.walkAcceleration = inputStream.readFloat32();
       this.maximumWalkDistance = inputStream.readFloat32();
       this.keepTime = inputStream.readFloat32();
       this.echoSpacing = inputStream.readFloat32();
  };

  dis.FalseTargetsAttribute.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeUShort(this.falseTargetCount);
       outputStream.writeFloat32(this.walkSpeed);
       outputStream.writeFloat32(this.walkAcceleration);
       outputStream.writeFloat32(this.maximumWalkDistance);
       outputStream.writeFloat32(this.keepTime);
       outputStream.writeFloat32(this.echoSpacing);
  };
}; // end of class

 // node.js module support
exports.FalseTargetsAttribute = dis.FalseTargetsAttribute;

// End of FalseTargetsAttribute class


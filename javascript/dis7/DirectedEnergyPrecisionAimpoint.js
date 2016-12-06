/**
 * DE Precision Aimpoint Record. Section 6.2.20.3
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


dis.DirectedEnergyPrecisionAimpoint = function()
{
   /** Type of Record */
   this.recordType = 4000;

   /** Length of Record */
   this.recordLength = 88;

   /** Padding */
   this.padding = 0;

   /** Position of Target Spot in World Coordinates. */
   this.targetSpotLocation = new dis.Vector3Double(); 

   /** Position (meters) of Target Spot relative to Entity Position. */
   this.targetSpotEntityLocation = new dis.Vector3Float(); 

   /** Velocity (meters/sec) of Target Spot. */
   this.targetSpotVelocity = new dis.Vector3Float(); 

   /** Acceleration (meters/sec/sec) of Target Spot. */
   this.targetSpotAcceleration = new dis.Vector3Float(); 

   /** Unique ID of the target entity. */
   this.targetEntityID = new dis.EntityID(); 

   /** Target Component ID ENUM, same as in DamageDescriptionRecord. */
   this.targetComponentID = 0;

   /** Spot Shape ENUM. */
   this.beamSpotType = 0;

   /** Beam Spot Cross Section Semi-Major Axis. */
   this.beamSpotCrossSectionSemiMajorAxis = 0;

   /** Beam Spot Cross Section Semi-Major Axis. */
   this.beamSpotCrossSectionSemiMinorAxis = 0;

   /** Beam Spot Cross Section Orientation Angle. */
   this.beamSpotCrossSectionOrientationAngle = 0;

   /** Peak irradiance */
   this.peakIrradiance = 0;

   /** padding */
   this.padding2 = 0;

  dis.DirectedEnergyPrecisionAimpoint.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.targetSpotLocation.initFromBinary(inputStream);
       this.targetSpotEntityLocation.initFromBinary(inputStream);
       this.targetSpotVelocity.initFromBinary(inputStream);
       this.targetSpotAcceleration.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.targetComponentID = inputStream.readUByte();
       this.beamSpotType = inputStream.readUByte();
       this.beamSpotCrossSectionSemiMajorAxis = inputStream.readFloat32();
       this.beamSpotCrossSectionSemiMinorAxis = inputStream.readFloat32();
       this.beamSpotCrossSectionOrientationAngle = inputStream.readFloat32();
       this.peakIrradiance = inputStream.readFloat32();
       this.padding2 = inputStream.readUInt();
  };

  dis.DirectedEnergyPrecisionAimpoint.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       this.targetSpotLocation.encodeToBinary(outputStream);
       this.targetSpotEntityLocation.encodeToBinary(outputStream);
       this.targetSpotVelocity.encodeToBinary(outputStream);
       this.targetSpotAcceleration.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.targetComponentID);
       outputStream.writeUByte(this.beamSpotType);
       outputStream.writeFloat32(this.beamSpotCrossSectionSemiMajorAxis);
       outputStream.writeFloat32(this.beamSpotCrossSectionSemiMinorAxis);
       outputStream.writeFloat32(this.beamSpotCrossSectionOrientationAngle);
       outputStream.writeFloat32(this.peakIrradiance);
       outputStream.writeUInt(this.padding2);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyPrecisionAimpoint = dis.DirectedEnergyPrecisionAimpoint;

// End of DirectedEnergyPrecisionAimpoint class


/**
 * Firing of a directed energy weapon shall be communicated by issuing a Directed Energy Fire PDU Section 7.3.4  COMPLETE
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


dis.DirectedEnergyFirePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 68;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** Field shall identify the munition type enumeration for the DE weapon beam, Section 7.3.4  */
   this.munitionType = new dis.EntityType(); 

   /** Field shall indicate the simulation time at start of the shot, Section 7.3.4  */
   this.shotStartTime = new dis.ClockTime(); 

   /** Field shall indicate the current cumulative duration of the shot, Section 7.3.4  */
   this.commulativeShotTime = 0;

   /** Field shall identify the location of the DE weapon aperture/emitter, Section 7.3.4  */
   this.ApertureEmitterLocation = new dis.Vector3Float(); 

   /** Field shall identify the beam diameter at the aperture/emitter, Section 7.3.4  */
   this.apertureDiameter = 0;

   /** Field shall identify the emissions wavelength in units of meters, Section 7.3.4  */
   this.wavelength = 0;

   /** Field shall identify the current peak irradiance of emissions in units of Watts per square meter, Section 7.3.4  */
   this.peakIrradiance = 0;

   /** field shall identify the current pulse repetition frequency in units of cycles per second (Hertz), Section 7.3.4  */
   this.pulseRepetitionFrequency = 0;

   /** field shall identify the pulse width emissions in units of seconds, Section 7.3.4 */
   this.pulseWidth = 0;

   /** 16bit Boolean field shall contain various flags to indicate status information needed to process a DE, Section 7.3.4  */
   this.flags = 0;

   /** Field shall identify the pulse shape and shall be represented as an 8-bit enumeration, Section 7.3.4  */
   this.pulseShape = 0;

   /** padding, Section 7.3.4  */
   this.padding1 = 0;

   /** padding, Section 7.3.4  */
   this.padding2 = 0;

   /** padding, Section 7.3.4  */
   this.padding3 = 0;

   /** Field shall specify the number of DE records, Section 7.3.4  */
   this.numberOfDERecords = 0;

   /** Fields shall contain one or more DE records, records shall conform to the variable record format (Section6.2.82), Section 7.3.4 */
    this.dERecords = new Array();
 
  dis.DirectedEnergyFirePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionType.initFromBinary(inputStream);
       this.shotStartTime.initFromBinary(inputStream);
       this.commulativeShotTime = inputStream.readFloat32();
       this.ApertureEmitterLocation.initFromBinary(inputStream);
       this.apertureDiameter = inputStream.readFloat32();
       this.wavelength = inputStream.readFloat32();
       this.peakIrradiance = inputStream.readFloat32();
       this.pulseRepetitionFrequency = inputStream.readFloat32();
       this.pulseWidth = inputStream.readInt();
       this.flags = inputStream.readInt();
       this.pulseShape = inputStream.readByte();
       this.padding1 = inputStream.readUByte();
       this.padding2 = inputStream.readUInt();
       this.padding3 = inputStream.readUShort();
       this.numberOfDERecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDERecords; idx++)
       {
           var anX = new dis.StandardVariableSpecification();
           anX.initFromBinary(inputStream);
           this.dERecords.push(anX);
       }

  };

  dis.DirectedEnergyFirePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionType.encodeToBinary(outputStream);
       this.shotStartTime.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.commulativeShotTime);
       this.ApertureEmitterLocation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.apertureDiameter);
       outputStream.writeFloat32(this.wavelength);
       outputStream.writeFloat32(this.peakIrradiance);
       outputStream.writeFloat32(this.pulseRepetitionFrequency);
       outputStream.writeInt(this.pulseWidth);
       outputStream.writeInt(this.flags);
       outputStream.writeByte(this.pulseShape);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUInt(this.padding2);
       outputStream.writeUShort(this.padding3);
       outputStream.writeUShort(this.numberOfDERecords);
       for(var idx = 0; idx < this.dERecords.length; idx++)
       {
        this.dERecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DirectedEnergyFirePdu = dis.DirectedEnergyFirePdu;

// End of DirectedEnergyFirePdu class


/**
 * Section 5.3.8.1. Detailed information about a radio transmitter. This PDU requires manually         written code to complete, since the modulation parameters are of variable length. UNFINISHED
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
dis.TransmitterPdu = function()
{
   /**
    * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
    * @type {number}
    * @instance
    */
   this.protocolVersion = 6;

   /**
    * Exercise ID
    * @type {number}
    * @instance
    */
   this.exerciseID = 0;

   /**
    * Type of pdu, unique for each PDU class
    * @type {number}
    * @instance
    */
   this.pduType = 25;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 4;

   /**
    * Timestamp value
    * @type {number}
    * @instance
    */
   this.timestamp = 0;

   /**
    * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
    * @type {number}
    * @instance
    */
   this.pduLength = 0;

   /**
    * zero-filled array of padding
    * @type {number}
    * @instance
    */
   this.padding = 0;

   /**
    * ID of the entity that is the source of the communication, ie contains the radio
    * @type {EntityID}
    * @instance
    */
   this.entityId = new dis.EntityID(); 

   /**
    * particular radio within an entity
    * @type {number}
    * @instance
    */
   this.radioId = 0;

   /**
    * linear accelleration of entity
    * @type {RadioEntityType}
    * @instance
    */
   this.radioEntityType = new dis.RadioEntityType(); 

   /**
    * transmit state
    * @type {number}
    * @instance
    */
   this.transmitState = 0;

   /**
    * input source
    * @type {number}
    * @instance
    */
   this.inputSource = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * Location of antenna
    * @type {Vector3Double}
    * @instance
    */
   this.antennaLocation = new dis.Vector3Double(); 

   /**
    * relative location of antenna, in entity coordinates
    * @type {Vector3Float}
    * @instance
    */
   this.relativeAntennaLocation = new dis.Vector3Float(); 

   /**
    * antenna pattern type
    * @type {number}
    * @instance
    */
   this.antennaPatternType = 0;

   /**
    * atenna pattern length
    * @type {number}
    * @instance
    */
   this.antennaPatternCount = 0;

   /**
    * frequency
    * @type {number}
    * @instance
    */
   this.frequency = 0;

   /**
    * transmit frequency Bandwidth
    * @type {number}
    * @instance
    */
   this.transmitFrequencyBandwidth = 0;

   /**
    * transmission power
    * @type {number}
    * @instance
    */
   this.power = 0;

   /**
    * modulation
    * @type {ModulationType}
    * @instance
    */
   this.modulationType = new dis.ModulationType(); 

   /**
    * crypto system enumeration
    * @type {number}
    * @instance
    */
   this.cryptoSystem = 0;

   /**
    * crypto system key identifer
    * @type {number}
    * @instance
    */
   this.cryptoKeyId = 0;

   /**
    * how many modulation parameters we have
    * @type {number}
    * @instance
    */
   this.modulationParameterCount = 0;

   /**
    * padding2
    * @type {number}
    * @instance
    */
   this.padding2 = 0;

   /**
    * padding3
    * @type {number}
    * @instance
    */
   this.padding3 = 0;

   /**
    * variable length list of modulation parameters
    * @type {Array<ModulationType>}
    * @instance
    */
    this.modulationParametersList = new Array();
 
   /**
    * variable length list of antenna pattern records
    * @type {Array<BeamAntennaPattern>}
    * @instance
    */
    this.antennaPatternList = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.TransmitterPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityId.initFromBinary(inputStream);
       this.radioId = inputStream.readUShort();
       this.radioEntityType.initFromBinary(inputStream);
       this.transmitState = inputStream.readUByte();
       this.inputSource = inputStream.readUByte();
       this.padding1 = inputStream.readUShort();
       this.antennaLocation.initFromBinary(inputStream);
       this.relativeAntennaLocation.initFromBinary(inputStream);
       this.antennaPatternType = inputStream.readUShort();
       this.antennaPatternCount = inputStream.readUShort();
       this.frequency = inputStream.readLong();
       this.transmitFrequencyBandwidth = inputStream.readFloat32();
       this.power = inputStream.readFloat32();
       this.modulationType.initFromBinary(inputStream);
       this.cryptoSystem = inputStream.readUShort();
       this.cryptoKeyId = inputStream.readUShort();
       this.modulationParameterCount = inputStream.readUByte();
       this.padding2 = inputStream.readUShort();
       this.padding3 = inputStream.readUByte();
       for(var idx = 0; idx < this.modulationParameterCount; idx++)
       {
           var anX = new dis.ModulationType();
           anX.initFromBinary(inputStream);
           this.modulationParametersList.push(anX);
       }

       for(var idx = 0; idx < this.antennaPatternCount; idx++)
       {
           var anX = new dis.BeamAntennaPattern();
           anX.initFromBinary(inputStream);
           this.antennaPatternList.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.TransmitterPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUShort(this.radioId);
       this.radioEntityType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.transmitState);
       outputStream.writeUByte(this.inputSource);
       outputStream.writeUShort(this.padding1);
       this.antennaLocation.encodeToBinary(outputStream);
       this.relativeAntennaLocation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.antennaPatternType);
       outputStream.writeUShort(this.antennaPatternCount);
       outputStream.writeLong(this.frequency);
       outputStream.writeFloat32(this.transmitFrequencyBandwidth);
       outputStream.writeFloat32(this.power);
       this.modulationType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.cryptoSystem);
       outputStream.writeUShort(this.cryptoKeyId);
       outputStream.writeUByte(this.modulationParameterCount);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUByte(this.padding3);
       for(var idx = 0; idx < this.modulationParametersList.length; idx++)
       {
        this.modulationParametersList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.antennaPatternList.length; idx++)
       {
        this.antennaPatternList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.TransmitterPdu = dis.TransmitterPdu;

// End of TransmitterPdu class


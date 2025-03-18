/**
 * Section 5.3.7.2. Handles designating operations. COMPLETE
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
dis.DesignatorPdu = function()
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
   this.pduType = 24;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 6;

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
    * ID of the entity designating
    * @type {EntityID}
    * @instance
    */
   this.designatingEntityID = new dis.EntityID(); 

   /**
    * This field shall specify a unique emitter database number assigned to  differentiate between otherwise similar or identical emitter beams within an emitter system.
    * @type {number}
    * @instance
    */
   this.codeName = 0;

   /**
    * ID of the entity being designated
    * @type {EntityID}
    * @instance
    */
   this.designatedEntityID = new dis.EntityID(); 

   /**
    * This field shall identify the designator code being used by the designating entity
    * @type {number}
    * @instance
    */
   this.designatorCode = 0;

   /**
    * This field shall identify the designator output power in watts
    * @type {number}
    * @instance
    */
   this.designatorPower = 0;

   /**
    * This field shall identify the designator wavelength in units of microns
    * @type {number}
    * @instance
    */
   this.designatorWavelength = 0;

   /**
    * designtor spot wrt the designated entity
    * @type {Vector3Float}
    * @instance
    */
   this.designatorSpotWrtDesignated = new dis.Vector3Float(); 

   /**
    * designtor spot wrt the designated entity
    * @type {Vector3Float}
    * @instance
    */
   this.designatorSpotLocation = new dis.Vector3Double(); 

   /**
    * Dead reckoning algorithm
    * @type {number}
    * @instance
    */
   this.deadReckoningAlgorithm = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding2 = 0;

   /**
    * linear accelleration of entity
    * @type {Vector3Float}
    * @instance
    */
   this.entityLinearAcceleration = new dis.Vector3Float(); 

  /**
   * @param {InputStream} inputStream
   */
  dis.DesignatorPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.designatingEntityID.initFromBinary(inputStream);
       this.codeName = inputStream.readUShort();
       this.designatedEntityID.initFromBinary(inputStream);
       this.designatorCode = inputStream.readUShort();
       this.designatorPower = inputStream.readFloat32();
       this.designatorWavelength = inputStream.readFloat32();
       this.designatorSpotWrtDesignated.initFromBinary(inputStream);
       this.designatorSpotLocation.initFromBinary(inputStream);
       this.deadReckoningAlgorithm = inputStream.readByte();
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readByte();
       this.entityLinearAcceleration.initFromBinary(inputStream);
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.DesignatorPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.designatingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.codeName);
       this.designatedEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.designatorCode);
       outputStream.writeFloat32(this.designatorPower);
       outputStream.writeFloat32(this.designatorWavelength);
       this.designatorSpotWrtDesignated.encodeToBinary(outputStream);
       this.designatorSpotLocation.encodeToBinary(outputStream);
       outputStream.writeByte(this.deadReckoningAlgorithm);
       outputStream.writeUShort(this.padding1);
       outputStream.writeByte(this.padding2);
       this.entityLinearAcceleration.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DesignatorPdu = dis.DesignatorPdu;

// End of DesignatorPdu class


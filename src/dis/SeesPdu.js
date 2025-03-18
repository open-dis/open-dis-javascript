/**
 * Section 5.3.7.5. SEES PDU, supplemental emissions entity state information. COMPLETE
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
dis.SeesPdu = function()
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
   this.pduType = 30;

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
    * Originating entity ID
    * @type {EntityID}
    * @instance
    */
   this.orginatingEntityID = new dis.EntityID(); 

   /**
    * IR Signature representation index
    * @type {number}
    * @instance
    */
   this.infraredSignatureRepresentationIndex = 0;

   /**
    * acoustic Signature representation index
    * @type {number}
    * @instance
    */
   this.acousticSignatureRepresentationIndex = 0;

   /**
    * radar cross section representation index
    * @type {number}
    * @instance
    */
   this.radarCrossSectionSignatureRepresentationIndex = 0;

   /**
    * how many propulsion systems
    * @type {number}
    * @instance
    */
   this.numberOfPropulsionSystems = 0;

   /**
    * how many vectoring nozzle systems
    * @type {number}
    * @instance
    */
   this.numberOfVectoringNozzleSystems = 0;

   /**
    * variable length list of propulsion system data
    * @type {Array<PropulsionSystemData>}
    * @instance
    */
    this.propulsionSystemData = new Array();
 
   /**
    * variable length list of vectoring system data
    * @type {Array<VectoringNozzleSystemData>}
    * @instance
    */
    this.vectoringSystemData = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.SeesPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.infraredSignatureRepresentationIndex = inputStream.readUShort();
       this.acousticSignatureRepresentationIndex = inputStream.readUShort();
       this.radarCrossSectionSignatureRepresentationIndex = inputStream.readUShort();
       this.numberOfPropulsionSystems = inputStream.readUShort();
       this.numberOfVectoringNozzleSystems = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfPropulsionSystems; idx++)
       {
           var anX = new dis.PropulsionSystemData();
           anX.initFromBinary(inputStream);
           this.propulsionSystemData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVectoringNozzleSystems; idx++)
       {
           var anX = new dis.VectoringNozzleSystemData();
           anX.initFromBinary(inputStream);
           this.vectoringSystemData.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.SeesPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.infraredSignatureRepresentationIndex);
       outputStream.writeUShort(this.acousticSignatureRepresentationIndex);
       outputStream.writeUShort(this.radarCrossSectionSignatureRepresentationIndex);
       outputStream.writeUShort(this.numberOfPropulsionSystems);
       outputStream.writeUShort(this.numberOfVectoringNozzleSystems);
       for(var idx = 0; idx < this.propulsionSystemData.length; idx++)
       {
        this.propulsionSystemData[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.vectoringSystemData.length; idx++)
       {
        this.vectoringSystemData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SeesPdu = dis.SeesPdu;

// End of SeesPdu class


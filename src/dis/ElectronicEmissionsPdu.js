/**
 * Section 5.3.7.1. Information about active electronic warfare (EW) emissions and active EW countermeasures shall be communicated using an Electromagnetic Emission PDU. COMPLETE (I think)
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
dis.ElectronicEmissionsPdu = function()
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
   this.pduType = 23;

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
    * ID of the entity emitting
    * @type {EntityID}
    * @instance
    */
   this.emittingEntityID = new dis.EntityID(); 

   /**
    * ID of event
    * @type {EventID}
    * @instance
    */
   this.eventID = new dis.EventID(); 

   /**
    * This field shall be used to indicate if the data in the PDU represents a state update or just data that has changed since issuance of the last Electromagnetic Emission PDU [relative to the identified entity and emission system(s)].
    * @type {number}
    * @instance
    */
   this.stateUpdateIndicator = 0;

   /**
    * This field shall specify the number of emission systems being described in the current PDU.
    * @type {number}
    * @instance
    */
   this.numberOfSystems = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.paddingForEmissionsPdu = 0;

   /**
    * Electronic emmissions systems
    * @type {Array<ElectronicEmissionSystemData>}
    * @instance
    */
    this.systems = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.ElectronicEmissionsPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateUpdateIndicator = inputStream.readUByte();
       this.numberOfSystems = inputStream.readUByte();
       this.paddingForEmissionsPdu = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfSystems; idx++)
       {
           var anX = new dis.ElectronicEmissionSystemData();
           anX.initFromBinary(inputStream);
           this.systems.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ElectronicEmissionsPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.stateUpdateIndicator);
       outputStream.writeUByte(this.numberOfSystems);
       outputStream.writeUShort(this.paddingForEmissionsPdu);
       for(var idx = 0; idx < this.systems.length; idx++)
       {
        this.systems[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionsPdu = dis.ElectronicEmissionsPdu;

// End of ElectronicEmissionsPdu class


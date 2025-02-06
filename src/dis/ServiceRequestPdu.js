/**
 * Section 5.3.5.1. Information about a request for supplies. COMPLETE
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
dis.ServiceRequestPdu = function()
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
   this.pduType = 5;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 3;

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
    * Entity that is requesting service
    * @type {EntityID}
    * @instance
    */
   this.requestingEntityID = new dis.EntityID(); 

   /**
    * Entity that is providing the service
    * @type {EntityID}
    * @instance
    */
   this.servicingEntityID = new dis.EntityID(); 

   /**
    * type of service requested
    * @type {number}
    * @instance
    */
   this.serviceTypeRequested = 0;

   /**
    * How many requested
    * @type {number}
    * @instance
    */
   this.numberOfSupplyTypes = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.serviceRequestPadding = 0;

   /**
    * @type {Array<SupplyQuantity>}
    * @instance
    */
    this.supplies = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.ServiceRequestPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.requestingEntityID.initFromBinary(inputStream);
       this.servicingEntityID.initFromBinary(inputStream);
       this.serviceTypeRequested = inputStream.readUByte();
       this.numberOfSupplyTypes = inputStream.readUByte();
       this.serviceRequestPadding = inputStream.readShort();
       for(var idx = 0; idx < this.numberOfSupplyTypes; idx++)
       {
           var anX = new dis.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ServiceRequestPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.requestingEntityID.encodeToBinary(outputStream);
       this.servicingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.serviceTypeRequested);
       outputStream.writeUByte(this.numberOfSupplyTypes);
       outputStream.writeShort(this.serviceRequestPadding);
       for(var idx = 0; idx < this.supplies.length; idx++)
       {
        this.supplies[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ServiceRequestPdu = dis.ServiceRequestPdu;

// End of ServiceRequestPdu class


/**
 * Service Request PDU shall be used to communicate information associated with                            one entity requesting a service from another). Section 7.4.2 COMPLETE
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


dis.ServiceRequestPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 5;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is requesting service (see 6.2.28), Section 7.4.2 */
   this.requestingEntityID = new dis.EntityID(); 

   /** Entity that is providing the service (see 6.2.28), Section 7.4.2 */
   this.servicingEntityID = new dis.EntityID(); 

   /** Type of service requested, Section 7.4.2 */
   this.serviceTypeRequested = 0;

   /** How many requested, Section 7.4.2 */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.serviceRequestPadding = 0;

   /** Field shall specify the type of supply and the amount of that supply for the number specified in the numberOfSupplyTypes (see 6.2.85), Section 7.4.2 */
    this.supplies = new Array();
 
  dis.ServiceRequestPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
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

  dis.ServiceRequestPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
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


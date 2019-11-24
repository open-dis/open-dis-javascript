/**
 *  Detailed inofrmation about the state of an intercom device and the actions it is requestion         of another intercom device, or the response to a requested action. Required manual intervention to fix the intercom parameters,        which can be of varialbe length. Section 7.7.5 UNFINSISHED
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


dis.IntercomControlPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 32;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** control type */
   this.controlType = 0;

   /** control type */
   this.communicationsChannelType = 0;

   /** Source entity ID */
   this.sourceEntityID = new dis.EntityID(); 

   /** The specific intercom device being simulated within an entity. */
   this.sourceCommunicationsDeviceID = 0;

   /** Line number to which the intercom control refers */
   this.sourceLineID = 0;

   /** priority of this message relative to transmissons from other intercom devices */
   this.transmitPriority = 0;

   /** current transmit state of the line */
   this.transmitLineState = 0;

   /** detailed type requested. */
   this.command = 0;

   /** eid of the entity that has created this intercom channel. */
   this.masterEntityID = new dis.EntityID(); 

   /** specific intercom device that has created this intercom channel */
   this.masterCommunicationsDeviceID = 0;

   /** number of intercom parameters */
   this.intercomParametersLength = 0;

   /** ^^^This is wrong the length of the data field is variable. Using a long for now. */
    this.intercomParameters = new Array();
 
  dis.IntercomControlPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.controlType = inputStream.readUByte();
       this.communicationsChannelType = inputStream.readUByte();
       this.sourceEntityID.initFromBinary(inputStream);
       this.sourceCommunicationsDeviceID = inputStream.readUByte();
       this.sourceLineID = inputStream.readUByte();
       this.transmitPriority = inputStream.readUByte();
       this.transmitLineState = inputStream.readUByte();
       this.command = inputStream.readUByte();
       this.masterEntityID.initFromBinary(inputStream);
       this.masterCommunicationsDeviceID = inputStream.readUShort();
       this.intercomParametersLength = inputStream.readUInt();
       for(var idx = 0; idx < this.intercomParametersLength; idx++)
       {
           var anX = new dis.IntercomCommunicationsParameters();
           anX.initFromBinary(inputStream);
           this.intercomParameters.push(anX);
       }

  };

  dis.IntercomControlPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUByte(this.controlType);
       outputStream.writeUByte(this.communicationsChannelType);
       this.sourceEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.sourceCommunicationsDeviceID);
       outputStream.writeUByte(this.sourceLineID);
       outputStream.writeUByte(this.transmitPriority);
       outputStream.writeUByte(this.transmitLineState);
       outputStream.writeUByte(this.command);
       this.masterEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.masterCommunicationsDeviceID);
       outputStream.writeUInt(this.intercomParametersLength);
       for(var idx = 0; idx < this.intercomParameters.length; idx++)
       {
        this.intercomParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomControlPdu = dis.IntercomControlPdu;

// End of IntercomControlPdu class


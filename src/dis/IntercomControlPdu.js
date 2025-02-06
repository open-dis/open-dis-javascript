/**
 * Section 5.3.8.5. Detailed inofrmation about the state of an intercom device and the actions it is requestion         of another intercom device, or the response to a requested action. Required manual intervention to fix the intercom parameters,        which can be of varialbe length. UNFINSISHED
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
dis.IntercomControlPdu = function()
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
   this.pduType = 32;

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
    * control type
    * @type {number}
    * @instance
    */
   this.controlType = 0;

   /**
    * control type
    * @type {number}
    * @instance
    */
   this.communicationsChannelType = 0;

   /**
    * Source entity ID
    * @type {EntityID}
    * @instance
    */
   this.sourceEntityID = new dis.EntityID(); 

   /**
    * The specific intercom device being simulated within an entity.
    * @type {number}
    * @instance
    */
   this.sourceCommunicationsDeviceID = 0;

   /**
    * Line number to which the intercom control refers
    * @type {number}
    * @instance
    */
   this.sourceLineID = 0;

   /**
    * priority of this message relative to transmissons from other intercom devices
    * @type {number}
    * @instance
    */
   this.transmitPriority = 0;

   /**
    * current transmit state of the line
    * @type {number}
    * @instance
    */
   this.transmitLineState = 0;

   /**
    * detailed type requested.
    * @type {number}
    * @instance
    */
   this.command = 0;

   /**
    * eid of the entity that has created this intercom channel.
    * @type {number}
    * @instance
    */
   this.masterEntityID = new dis.EntityID(); 

   /**
    * specific intercom device that has created this intercom channel
    * @type {number}
    * @instance
    */
   this.masterCommunicationsDeviceID = 0;

   /**
    * number of intercom parameters
    * @type {number}
    * @instance
    */
   this.intercomParametersLength = 0;

   /**
    * Must be
    * @type {Array<IntercomCommunicationsParameters>}
    * @instance
    */
    this.intercomParameters = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.IntercomControlPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.IntercomControlPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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


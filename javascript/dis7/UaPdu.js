/**
 *  Information about underwater acoustic emmissions. This requires manual cleanup.  The beam data records should ALL be a the finish, rather than attached to each emitter system. Section 7.6.4. UNFINISHED
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


dis.UaPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 29;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the emission */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventIdentifier(); 

   /** This field shall be used to indicate whether the data in the UA PDU represent a state update or data that have changed since issuance of the last UA PDU */
   this.stateChangeIndicator = 0;

   /** padding */
   this.pad = 0;

   /** This field indicates which database record (or file) shall be used in the definition of passive signature (unintentional) emissions of the entity. The indicated database record (or  file) shall define all noise generated as a function of propulsion plant configurations and associated  auxiliaries. */
   this.passiveParameterIndex = 0;

   /** This field shall specify the entity propulsion plant configuration. This field is used to determine the passive signature characteristics of an entity. */
   this.propulsionPlantConfiguration = 0;

   /**  This field shall represent the number of shafts on a platform */
   this.numberOfShafts = 0;

   /** This field shall indicate the number of APAs described in the current UA PDU */
   this.numberOfAPAs = 0;

   /** This field shall specify the number of UA emitter systems being described in the current UA PDU */
   this.numberOfUAEmitterSystems = 0;

   /** shaft RPM values. THIS IS WRONG. It has the wrong class in the list. */
    this.shaftRPMs = new Array();
 
   /** apaData. THIS IS WRONG. It has the worng class in the list. */
    this.apaData = new Array();
 
   /** THIS IS WRONG. It has the wrong class in the list. */
    this.emitterSystems = new Array();
 
  dis.UaPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateChangeIndicator = inputStream.readByte();
       this.pad = inputStream.readByte();
       this.passiveParameterIndex = inputStream.readUShort();
       this.propulsionPlantConfiguration = inputStream.readUByte();
       this.numberOfShafts = inputStream.readUByte();
       this.numberOfAPAs = inputStream.readUByte();
       this.numberOfUAEmitterSystems = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfShafts; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.shaftRPMs.push(anX);
       }

       for(var idx = 0; idx < this.numberOfAPAs; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.apaData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfUAEmitterSystems; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.emitterSystems.push(anX);
       }

  };

  dis.UaPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeByte(this.stateChangeIndicator);
       outputStream.writeByte(this.pad);
       outputStream.writeUShort(this.passiveParameterIndex);
       outputStream.writeUByte(this.propulsionPlantConfiguration);
       outputStream.writeUByte(this.numberOfShafts);
       outputStream.writeUByte(this.numberOfAPAs);
       outputStream.writeUByte(this.numberOfUAEmitterSystems);
       for(var idx = 0; idx < this.shaftRPMs.length; idx++)
       {
        this.shaftRPMs[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.apaData.length; idx++)
       {
        this.apaData[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.emitterSystems.length; idx++)
       {
        this.emitterSystems[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.UaPdu = dis.UaPdu;

// End of UaPdu class


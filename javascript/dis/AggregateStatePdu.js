/**
 * Section 5.3.9.1 informationa bout aggregating entities anc communicating information about the aggregated entities.        requires manual intervention to fix the padding between entityID lists and silent aggregate sysem lists--this padding        is dependent on how many entityIDs there are, and needs to be on a 32 bit word boundary. UNFINISHED
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


dis.AggregateStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 33;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of aggregated entities */
   this.aggregateID = new dis.EntityID(); 

   /** force ID */
   this.forceID = 0;

   /** state of aggregate */
   this.aggregateState = 0;

   /** entity type of the aggregated entities */
   this.aggregateType = new dis.EntityType(); 

   /** formation of aggregated entities */
   this.formation = 0;

   /** marking for aggregate; first char is charset type, rest is char data */
   this.aggregateMarking = new dis.AggregateMarking(); 

   /** dimensions of bounding box for the aggregated entities, origin at the center of mass */
   this.dimensions = new dis.Vector3Float(); 

   /** orientation of the bounding box */
   this.orientation = new dis.Orientation(); 

   /** center of mass of the aggregation */
   this.centerOfMass = new dis.Vector3Double(); 

   /** velocity of aggregation */
   this.velocity = new dis.Vector3Float(); 

   /** number of aggregates */
   this.numberOfDisAggregates = 0;

   /** number of entities */
   this.numberOfDisEntities = 0;

   /** number of silent aggregate types */
   this.numberOfSilentAggregateTypes = 0;

   /** number of silent entity types */
   this.numberOfSilentEntityTypes = 0;

   /** aggregates  list */
    this.aggregateIDList = new Array();
 
   /** entity ID list */
    this.entityIDList = new Array();
 
   /** ^^^padding to put the start of the next list on a 32 bit boundary. This needs to be fixed */
   this.pad2 = 0;

   /** silent entity types */
    this.silentAggregateSystemList = new Array();
 
   /** silent entity types */
    this.silentEntitySystemList = new Array();
 
   /** number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variableDatums */
    this.variableDatumList = new Array();
 
  dis.AggregateStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.aggregateID.initFromBinary(inputStream);
       this.forceID = inputStream.readUByte();
       this.aggregateState = inputStream.readUByte();
       this.aggregateType.initFromBinary(inputStream);
       this.formation = inputStream.readUInt();
       this.aggregateMarking.initFromBinary(inputStream);
       this.dimensions.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.centerOfMass.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.numberOfDisAggregates = inputStream.readUShort();
       this.numberOfDisEntities = inputStream.readUShort();
       this.numberOfSilentAggregateTypes = inputStream.readUShort();
       this.numberOfSilentEntityTypes = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDisAggregates; idx++)
       {
           var anX = new dis.AggregateID();
           anX.initFromBinary(inputStream);
           this.aggregateIDList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfDisEntities; idx++)
       {
           var anX = new dis.EntityID();
           anX.initFromBinary(inputStream);
           this.entityIDList.push(anX);
       }

       this.pad2 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfSilentAggregateTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.silentAggregateSystemList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfSilentEntityTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.silentEntitySystemList.push(anX);
       }

       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumList.push(anX);
       }

  };

  dis.AggregateStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.aggregateID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.aggregateState);
       this.aggregateType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.formation);
       this.aggregateMarking.encodeToBinary(outputStream);
       this.dimensions.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       this.centerOfMass.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeUShort(this.numberOfDisAggregates);
       outputStream.writeUShort(this.numberOfDisEntities);
       outputStream.writeUShort(this.numberOfSilentAggregateTypes);
       outputStream.writeUShort(this.numberOfSilentEntityTypes);
       for(var idx = 0; idx < this.aggregateIDList.length; idx++)
       {
        this.aggregateIDList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.entityIDList.length; idx++)
       {
        this.entityIDList[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUByte(this.pad2);
       for(var idx = 0; idx < this.silentAggregateSystemList.length; idx++)
       {
        this.silentAggregateSystemList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.silentEntitySystemList.length; idx++)
       {
        this.silentEntitySystemList[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.variableDatumList.length; idx++)
       {
        this.variableDatumList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.AggregateStatePdu = dis.AggregateStatePdu;

// End of AggregateStatePdu class


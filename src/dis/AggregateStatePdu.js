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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.AggregateStatePdu = function()
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
   this.pduType = 33;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 7;

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
    * ID of aggregated entities
    * @type {EntityID}
    * @instance
    */
   this.aggregateID = new dis.EntityID(); 

   /**
    * force ID
    * @type {number}
    * @instance
    */
   this.forceID = 0;

   /**
    * state of aggregate
    * @type {number}
    * @instance
    */
   this.aggregateState = 0;

   /**
    * entity type of the aggregated entities
    * @type {EntityType}
    * @instance
    */
   this.aggregateType = new dis.EntityType(); 

   /**
    * formation of aggregated entities
    * @type {number}
    * @instance
    */
   this.formation = 0;

   /**
    * marking for aggregate; first char is charset type, rest is char data
    * @type {AggregateMarking}
    * @instance
    */
   this.aggregateMarking = new dis.AggregateMarking(); 

   /**
    * dimensions of bounding box for the aggregated entities, origin at the center of mass
    * @type {Vector3Float}
    * @instance
    */
   this.dimensions = new dis.Vector3Float(); 

   /**
    * orientation of the bounding box
    * @type {Orientation}
    * @instance
    */
   this.orientation = new dis.Orientation(); 

   /**
    * center of mass of the aggregation
    * @type {Vector3Double}
    * @instance
    */
   this.centerOfMass = new dis.Vector3Double(); 

   /**
    * velocity of aggregation
    * @type {Vector3Float}
    * @instance
    */
   this.velocity = new dis.Vector3Float(); 

   /**
    * number of aggregates
    * @type {number}
    * @instance
    */
   this.numberOfDisAggregates = 0;

   /**
    * number of entities
    * @type {number}
    * @instance
    */
   this.numberOfDisEntities = 0;

   /**
    * number of silent aggregate types
    * @type {number}
    * @instance
    */
   this.numberOfSilentAggregateTypes = 0;

   /**
    * number of silent entity types
    * @type {number}
    * @instance
    */
   this.numberOfSilentEntityTypes = 0;

   /**
    * aggregates  list
    * @type {Array<AggregateID>}
    * @instance
    */
    this.aggregateIDList = new Array();
 
   /**
    * entity ID list
    * @type {Array<EntityID>}
    * @instance
    */
    this.entityIDList = new Array();
 
   /**
    * ^^^padding to put the start of the next list on a 32 bit boundary. This needs to be fixed
    * @type {number}
    * @instance
    */
   this.pad2 = 0;

   /**
    * silent entity types
    * @type {Array<EntityType>}
    * @instance
    */
    this.silentAggregateSystemList = new Array();
 
   /**
    * silent entity types
    * @type {Array<EntityType>}
    * @instance
    */
    this.silentEntitySystemList = new Array();
 
   /**
    * number of variable datum records
    * @type {number}
    * @instance
    */
   this.numberOfVariableDatumRecords = 0;

   /**
    * variableDatums
    * @type {Array<VariableDatum>}
    * @instance
    */
    this.variableDatumList = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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

